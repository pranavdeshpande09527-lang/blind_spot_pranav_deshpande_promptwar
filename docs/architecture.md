# Third Eye architecture

The existing index.html remains the visual frontend. Add minimal browser modules for Supabase Auth, authenticated API requests, history and reflection state while retaining the established CSS and rendering functions. Express serves the frontend and /api on one Render origin. Compile backend TypeScript and bundle browser dependencies only if needed; do not require a framework migration.

Browser → Supabase Auth establishes identity. Browser → Express carries a bearer token. Express verifies it, then uses a request-scoped Supabase client with that JWT; RLS enforces ownership. Express → Gemini performs bounded structured analysis. Optional Express → Tavily retrieves public evidence with consent; optional Groq provides a configured fallback. Provider secrets never enter public config or HTML.

Supabase stores decisions, immutable analysis snapshots/results, sources and reflection answers. Server-generated timestamps and database revisions are authoritative. No files on Render are used as persistent storage. See contracts.md for state and ownership rules.

The three-hour MVP uses bounded synchronous inference. A request creates a processing run, invokes provider stages within one shared deadline and atomically commits output plus sources. Failure marks the run failed. A subsequent status/read/retry operation expires processing runs older than their recorded deadline after a process restart. Never hold a database transaction open while calling an AI provider.

Deploy one Render Node web service with /healthz, configured PORT and external Supabase storage. A successful build is not proof of working authentication, model access or a public deployment; verify all three explicitly.

