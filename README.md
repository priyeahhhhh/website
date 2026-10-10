# Website

Personal portfolio built with SvelteKit 2 (Svelte 5), Tailwind CSS v4 and plain JavaScript, deployed on Vercel. It includes an AI chatbot that answers questions about me, powered by the OpenAI API.

## Develop

Requires Node 22.x.

```bash
npm install
cp .env.example .env   # then add your OpenAI API key
npm run dev
```

## Environment variables

| Variable                   | Purpose                                                              |
| -------------------------- | -------------------------------------------------------------------- |
| `OPENAI_API_KEY`           | Key used by `/api/chat` (required)                                   |
| `OPENAI_MODEL`             | Chat model, defaults to `gpt-4o-mini`                                |
| `UPSTASH_REDIS_REST_URL`   | Upstash Redis URL for rate limiting (required in production)         |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token for rate limiting (required in production)       |
| `CHAT_GLOBAL_DAILY_LIMIT`  | Chat requests allowed per day across all visitors, defaults to `500` |

Set the same variables in Vercel under Project Settings → Environment Variables, and mark `OPENAI_API_KEY` and the Upstash token as Sensitive. The Upstash integration from the Vercel Marketplace may add them as `KV_REST_API_URL` / `KV_REST_API_TOKEN`, which the code also accepts.

## Rate limiting

`/api/chat` allows 5 requests per minute and 30 per day per IP, plus a global daily cap. Over the limit it returns 429 with a `Retry-After` header. In production it fails closed (503) if Redis isn't configured; locally it falls back to an in-memory limiter.

## Where the content lives

All content is hardcoded in the components under `src/lib/components/`. The chatbot's knowledge is the `SYSTEM_PROMPT` in `src/routes/api/chat/+server.js`, and the Speed Read text is in `Rsvp.svelte`. Keep these in sync when something changes.
