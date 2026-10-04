# Implemented source layout

The existing root index.html supplies the newspaper design. Browser logic is in browser/app.ts and the extracted original renderers are in browser/render.js. Build with npm run build.

server.ts starts Express; app.ts owns middleware/auth/routes; repository.ts implements owner-scoped database access; analysis.ts orchestrates durable runs; providers.ts contains Gemini/Groq/Tavily adapters; config.ts validates environment; shared/schemas.ts defines shared validation and grounding checks. openapi.ts generates the API specification. Executable SQL is in supabase/migrations and tests are in tests/.

Serve only explicit public files/assets, never the whole project directory: .env, prompts and backend source must not be downloadable. Keep browser Supabase session handling separate from server-only provider credentials.
