# Third Eye architecture

The existing index.html remains the visual frontend. Add minimal browser modules for Supabase Auth, authenticated API requests, history and reflection state while retaining the established CSS and rendering functions. Express serves the frontend and /api on one Render origin. Compile backend TypeScript and bundle browser dependencies only if needed; do not require a framework migration.

Implemented modules: `src/browser/app.ts` connects the existing layout to real APIs; `src/browser/render.js` preserves its original renderer vocabulary. `src/app.ts` implements middleware/routes, `src/repository.ts` database access, `src/analysis.ts` the durable run protocol, and `src/providers.ts` provider adapters. `scripts/build.mjs` bundles browser dependencies and writes OpenAPI. Provider JSON schemas use structural constraints compatible with the service; complete Zod limits and grounding checks remain authoritative on the server. Gemini 3 requests use low thinking effort to fit the interactive deadline. Groq fallback uses strict JSON-schema output and requires a compatible model. See provider documentation: https://ai.google.dev/gemini-api/docs/structured-output and https://console.groq.com/docs/structured-outputs.

Browser → Supabase Auth establishes identity. Browser → Express carries a bearer token. Express verifies it, then uses a request-scoped Supabase client with that JWT; RLS enforces ownership. Express → Gemini performs bounded structured analysis. Optional Express → Tavily retrieves public evidence with consent; optional Groq provides a configured fallback. Provider secrets never enter public config or HTML.

Supabase stores decisions, immutable analysis snapshots/results, sources and reflection answers. Server-generated timestamps and database revisions are authoritative. No files on Render are used as persistent storage. See contracts.md for state and ownership rules.

The three-hour MVP uses bounded synchronous inference. A request creates a processing run, invokes provider stages within one shared deadline and atomically commits output plus sources. Failure marks the run failed. A subsequent status/read/retry operation expires processing runs older than their recorded deadline after a process restart. Never hold a database transaction open while calling an AI provider.

Deploy one Render Node web service with /healthz, configured PORT and external Supabase storage. A successful build is not proof of working authentication, model access or a public deployment; verify all three explicitly.
