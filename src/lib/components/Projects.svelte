<script>
	const projects = [
		{
			title: 'Cotton Growth Stage Classification & Fertilizer Alerts',
			description:
				'Client capstone for Gaiadhi. Led a 4-person team building <span class="tldr-em">two LightGBM models in Python</span> that classify cotton growth stage and <span class="tldr-em">warn 7 days before the fertilizer-critical stage</span>, using 135K+ simulation records. Removed stage-proxy variables that inflated early scores, validated on unseen runs, treatments and future years, and engineered lag and rolling features. Delivered a phased deployment roadmap.',
			tags: ['Machine Learning', 'Client Project', 'Team Lead'],
			year: '2026',
			link: null,
			stats: [
				{ value: '0.92', label: 'Stage macro F1, up from 0.48' },
				{ value: '0.87', label: 'Alert PR-AUC, up from 0.35' },
				{ value: '83%', label: 'Transitions caught, 84% precision' }
			]
		},
		{
			title: 'Grocery Price Elasticity & Promotion Analysis',
			description:
				'Estimated price elasticity across 3 grocery categories from <span class="tldr-em">10M+ weekly scanner records (93 stores)</span> with store-SKU and week fixed-effects regressions in Python: analgesics inelastic (-0.75), cereals and frozen juices more price-sensitive (-1.4 and -1.7). Modeled that a <span class="tldr-em">5% mid-tier cereal price increase would raise annual gross profit ~19% ($580K)</span> while cutting volume ~8%. Price-reduction promotions lifted gross profit ~113% vs. each store-SKU\'s regular-price weeks; one promo code (G) lost money.',
			tags: ['Pricing Analytics', 'Python', 'Regression'],
			year: '2026',
			link: null,
			stats: [
				{ value: '10M+', label: 'Weekly scanner records' },
				{ value: '$580K', label: 'Modeled annual profit gain' },
				{ value: '+113%', label: 'Profit lift from price cuts' }
			]
		},
		{
			title: 'Interest Rate Forecasting Model',
			description:
				'Built <span class="tldr-em">ETS, ARIMA, ARIMAX and VAR models in R</span> on 10 years of monthly interest rate data. <span class="tldr-em">VAR(2) cut RMSE 77% versus the ETS benchmark</span> on a 25-month holdout, as its joint modeling of rates, VIX, TED spread, EFFR and exchange rate had the lowest error. ARIMAX predictors were selected by AICc.',
			tags: ['Forecasting', 'R', 'Time Series'],
			year: '2025',
			link: null,
			stats: [
				{ value: '77%', label: 'RMSE cut vs. ETS benchmark' },
				{ value: '0.57', label: 'RMSE (ETS: 2.47)' },
				{ value: '25', label: 'Month holdout' }
			]
		}
	];
</script>

<section id="work" class="mx-auto max-w-5xl px-6 py-10 md:py-16">
	<h2 class="mb-1 text-xl font-semibold text-balance text-ink md:text-2xl">notable projects</h2>
	<p class="mb-8 text-sm text-pretty text-ink-muted">Client work and analysis, from raw data to recommendation.</p>

	<div class="grid gap-5 md:grid-cols-2">
		{#each projects as project}
			<div
				class="grid grid-rows-[auto_auto_1fr_auto] rounded-lg border border-border bg-card p-5 md:p-6 transition-shadow hover:shadow-md"
			>
				<div class="mb-3 flex flex-wrap items-center gap-2">
					{#each project.tags as tag}
						<span
							class="rounded-full border border-border bg-cream px-2.5 py-0.5 text-xs font-medium text-ink-light"
							>{tag}</span
						>
					{/each}
					<span class="ml-auto text-xs text-ink-muted">{project.year}</span>
				</div>

				<div class="mb-1.5 flex items-center gap-2">
					<h3 class="text-lg font-semibold text-balance text-ink">{project.title}</h3>
					{#if project.link}
						<a href={project.link} target="_blank" rel="noopener noreferrer" class="text-ink-muted transition-colors hover:text-ink" aria-label="Visit {project.title}">
							<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
						</a>
					{/if}
				</div>
				<!-- @html safe: project.description is static content from projects array only -->
				<p class="tldr-dim text-sm text-pretty text-ink-light">{@html project.description}</p>

				{#if project.stats.length > 0}
					<div class="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4">
						{#each project.stats as stat}
							<div>
								<p class="text-xl font-bold text-ink tabular-nums">{stat.value}</p>
								<p class="text-xs text-ink-muted">{stat.label}</p>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</section>
