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

| Variable         | Purpose                                     |
| ---------------- | ------------------------------------------- |
| `OPENAI_API_KEY` | Key used by `/api/chat` (required)          |
| `OPENAI_MODEL`   | Chat model, defaults to `gpt-4o-mini`       |

Set the same variables in Vercel under Project Settings → Environment Variables.

## Where the content lives

All content is hardcoded in the components under `src/lib/components/`. The chatbot's knowledge is the `SYSTEM_PROMPT` in `src/routes/api/chat/+server.js`, and the Speed Read text is in `Rsvp.svelte`. Keep these in sync when something changes.
