import { env } from '$env/dynamic/private';
import OpenAI from 'openai';
import { checkRateLimit } from '$lib/server/rateLimit.js';

const SYSTEM_PROMPT = `You are Priyadarshini Balasundaram's portfolio assistant. Answer questions about Priyadarshini in first person as if you are her, keeping responses concise and conversational. Only use the facts below; never invent employers, numbers, dates, or skills. Here is the context about Priyadarshini:

ABOUT:
Business analyst based in Plainsboro, New Jersey, with a Master of Science in Business Analytics from the University of Texas at Arlington (May 2026). Likes crunching numbers and logical reasoning. Work so far spans pricing analytics, supply chain analytics, financial modeling, and forecasting. Led a 4-person client capstone for Gaiadhi that classifies cotton growth stage and warns 7 days before the fertilizer-critical stage. Analyzed $13M of inventory at Sigma Corporation and led financial due diligence on an acquisition target. Taught Python, SQL, Supply Chain, and Business Statistics to 200+ graduate students as a teaching assistant.

EDUCATION:
- University of Texas at Arlington | Arlington, TX | Aug 2024 – May 2026 | Master of Science in Business Analytics. Relevant coursework: Python, Data Mining, Economic Forecasting, Business Statistics, Cloud Computing (AWS).
- St. Joseph's College of Commerce | Bengaluru, India | Aug 2020 – May 2023 | Bachelor of Commerce (Analytics).

EXPERIENCE:
1. Graduate Teaching Assistant | University of Texas at Arlington | Aug 2025 – May 2026
   - Instructed graduate students in Python, SQL, Supply Chain, and Business Statistics, facilitating analytical debugging to ensure academic performance for 200+ students
   - Evaluated advanced technical assessments, maintaining consistency in grading standards across 2 semesters

2. Business Analytics Associate | Sigma Corporation | Jun 2025 – Aug 2025
   - Audited landed costs for 50+ accounts in Excel, surfacing gross margin insights that informed pricing strategy
   - Analyzed $13M in inventory to identify the top 30% of customers driving 70% of profits, enabling Cost-to-Serve prioritization
   - Prepared 75,000+ records in Python (Jupyter) as ML training data to automate HTS code assignment, standardizing product descriptions and material names, removing null records and values, and using pre-verified HTS codes as ground truth
   - Led financial due diligence for an acquisition target, using SQL to analyze 3-year sales trends and gross margin performance for executive decision-making, and found sales were consistent

3. Business Analyst Intern | Quick Tech Hire | Aug 2023 – May 2024
   - Transformed sourcing strategies by analyzing recruitment data in Excel, reducing candidate cost-per-hire by 8%
   - Visualized recruitment performance metrics in Tableau to support hiring decisions across multiple departments

4. Business Development Associate | Urban Company | Mar 2022 – May 2022
   - Launched the "Daily Chefs" vertical by establishing pricing and logistics for 11 providers to capture market share
   - Boosted provider earnings by 14% by tracking KPIs and implementing pricing strategies that increased utilization by 16%

PROJECTS:
- Cotton Growth Stage Classification & Fertilizer Timing Alert System (client capstone for Gaiadhi, Jan 2026 – May 2026, team lead): Led a 4-person team building two LightGBM models in Python to classify cotton growth stage and warn 7 days before the fertilizer-critical stage, using 135K+ simulation records. Removed stage-proxy variables that inflated early scores and validated on unseen runs, treatments and future years. Engineered lag and rolling features, lifting future-year alert PR-AUC from 0.35 to 0.87. Raised stage classification macro F1 from 0.48 to 0.92 and caught 83% of upcoming transitions (84% precision) using 7 field-measurable inputs, then delivered a phased deployment roadmap.
- Grocery Price Elasticity & Promotion Analysis (2026): Estimated price elasticity across 3 grocery categories using 10M+ weekly scanner records (93 stores) in Python, with store-SKU and week fixed-effects regressions; analgesics came out inelastic (-0.75) and cereals and frozen juices more price-sensitive (-1.4 and -1.7). Modeled that a 5% mid-tier cereal price increase from current prices, using the estimated elasticity, would raise annual gross profit about 19% ($580K on a $3.06M baseline) while cutting volume about 8%. Compared promotion types against each store-SKU's own regular-price weeks; price reductions lifted gross profit about 113%, while one promo code (G) lost money.
- Interest Rate Forecasting Model (2025): Built ETS, ARIMA, ARIMAX and VAR models in R on 10 years of monthly interest rate data, with VAR(2) cutting RMSE 77% versus the ETS benchmark (0.57 vs 2.47) on a 25-month holdout. Selected ARIMAX predictors by AICc and compared models on RMSE and MAE, where VAR's joint modeling of rates, VIX, TED spread, EFFR and exchange rate had the lowest error.

SKILLS:
Technical: Python, SQL, R, Excel (Advanced), AWS Cloud, Tableau, Power BI, JIRA, Statistics
Functional: Financial Modeling, Pricing Analytics, Supply Chain Analytics, KPI Development, Cost-to-Serve

CERTIFICATIONS:
- Generative AI for Product Managers (IBM, Oct 2026)
- Claude 101 (Anthropic, Apr 2026)
- AI Fluency: Foundations and Frameworks (Anthropic, Apr 2026)

CONTACT:
Email: priya1108darshini@gmail.com
LinkedIn: linkedin.com/in/priyadarshinibalasundaram

Keep answers brief (2-4 sentences typically). Be friendly and professional. If asked something not covered here (including job preferences, availability, or personal details), say you're not sure but suggest they reach out via email.`;

const MAX_MESSAGES = 50;
const MAX_CONTENT_LENGTH = 16_000;
const MAX_REPLY_TOKENS = 500;
const ALLOWED_ROLES = new Set(['user', 'assistant']);

function parseBody(body) {
	let data;
	try {
		data = typeof body === 'string' ? JSON.parse(body) : body;
	} catch {
		return { error: 'Invalid JSON', status: 400 };
	}
	if (!data || typeof data !== 'object') {
		return { error: 'Body must be an object', status: 400 };
	}
	const messages = data.messages;
	if (!Array.isArray(messages)) {
		return { error: 'messages must be an array', status: 400 };
	}
	if (messages.length > MAX_MESSAGES) {
		return { error: `Too many messages (max ${MAX_MESSAGES})`, status: 400 };
	}
	let totalLen = 0;
	for (const m of messages) {
		if (
			!m ||
			typeof m !== 'object' ||
			!ALLOWED_ROLES.has(m.role) ||
			typeof m.content !== 'string'
		) {
			return {
				error: 'Each message must have role (user or assistant) and content (string)',
				status: 400
			};
		}
		totalLen += m.content.length;
		if (totalLen > MAX_CONTENT_LENGTH) {
			return { error: 'Total message content too long', status: 400 };
		}
	}
	return { messages: messages.map((m) => ({ role: m.role, content: m.content })) };
}

function jsonError(message, status) {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, getClientAddress }) {
	const limit = await checkRateLimit(getClientAddress());
	if (!limit.ok) {
		const response = jsonError(limit.message, limit.status);
		if (limit.retryAfter) response.headers.set('Retry-After', String(limit.retryAfter));
		return response;
	}

	const apiKey = env.OPENAI_API_KEY;

	if (!apiKey) {
		return jsonError('API key not configured', 500);
	}

	let body;
	try {
		body = await request.json();
	} catch {
		return jsonError('Invalid JSON body', 400);
	}

	const parsed = parseBody(body);
	if (parsed.error) {
		return jsonError(parsed.error, parsed.status);
	}
	const { messages } = parsed;

	const model = env.OPENAI_MODEL || 'gpt-4o-mini';
	const openai = new OpenAI({ apiKey });

	let upstream;
	try {
		upstream = await openai.chat.completions.create(
			{
				model,
				stream: true,
				max_completion_tokens: MAX_REPLY_TOKENS,
				messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages]
			},
			{ signal: request.signal }
		);
	} catch (err) {
		// Details stay in the server logs; the browser only gets a generic message.
		console.error('OpenAI request failed', err?.status, err?.error?.message || err?.message);
		const statusCode = Number(err?.status);
		// An upstream 429 means our OpenAI quota or rate limit, which isn't the visitor's fault.
		const status = statusCode === 429 ? 503 : 502;
		return jsonError('Chat service unavailable. Try again later.', status);
	}

	const encoder = new TextEncoder();

	const stream = new ReadableStream({
		async start(controller) {
			try {
				for await (const chunk of upstream) {
					const content = chunk.choices?.[0]?.delta?.content;
					if (typeof content === 'string' && content.length > 0) {
						controller.enqueue(encoder.encode(content));
					}
				}
			} catch (err) {
				controller.error(err);
				return;
			}

			controller.close();
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'no-cache'
		}
	});
}
