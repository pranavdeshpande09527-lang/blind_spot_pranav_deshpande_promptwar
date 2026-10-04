# Prompt coverage

All 67 Markdown files under `prompts/` were read. The canonical contracts guide implementation.

| Group | Implementation or explicit scope |
| --- | --- |
| 00 Master | Original design, live-only application data, Express/Supabase, no option ranking |
| 01 Planning | Shared schemas, API, generated OpenAPI, migration, architecture |
| 02 Frontend | Original CSS/IDs/renderers; auth, save/delete, archive, versions, answers, research state, errors, focus, reduced motion |
| 03 Backend | Verified auth, repositories, orchestration, atomic revisions and durable run lifecycle |
| 04 Database | SQL/RLS/ownership/indexes/replay/expiry; real local PostgreSQL tests. Hosted migration, backups, EXPLAIN and restore rehearsal need project setup |
| 05 AI | Fixed policy, runtime clock, snapshots, JSON schema, grounding validation, bounded attempts, Gemini/Groq/Tavily, answer memory, evaluation cases. Embeddings and autonomous tools are deferred |
| 06 Security | RLS, owner-checking functions, private lifecycle capability, origin/CSP/escaping, limits, redacted logging |
| 07 Tools | Lockfile, CI, Render blueprint, Supabase migration, health/logging. Resend is deferred; no remote push/deployment claimed |
| 08 Workflow | Implemented, compiled, tested, and diagnosed live configuration failures |
| 09 Testing | PostgreSQL, HTTP/schema/provider tests, desktop/mobile browser workflows, separately runnable live smoke. Hosted two-account auth remains an acceptance check |
| 11 Documentation | README, contracts/API/OpenAPI, operations, verification, demo narrative |

No vector database, autonomous agents, Redis, numeric confidence, option scores, production fixtures, fake evidence, transactional email product, or dashboards were added. These are outside the MVP or lack a measured requirement.

Extensions: analyses store `questions`; reflections store `question_text`; `ANALYSIS_SIGNING_SECRET` gates server-only run functions; public config exposes presence-based `analysisAvailable` and `setupRequired`. Snapshots include at most 16 recently updated answers. OpenAPI request schemas are generated from Zod and endpoint inventory is tested; detailed response records are described in `api.md` and `contracts.md`.
