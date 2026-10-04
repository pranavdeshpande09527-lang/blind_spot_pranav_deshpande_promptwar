# Third Eye — coding rules

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Keep the existing vanilla HTML/CSS/JavaScript frontend in index.html. Use TypeScript/Express and Zod for the backend, Supabase Auth/Postgres, and one Render Node service serving the existing frontend. Do not migrate to React or rebuild the design. Bundle browser modules only when needed with a minimal build setup and pinned lockfile.
- Use shared schemas, small provider adapters, explicit errors, parameterized queries and meaningful tests. All provider credentials stay on the server.
- All dates, history, counts, citations and analysis derive from runtime or persisted data. Store UTC timestamptz; format dates in the viewer’s timezone. Production must contain no fake result fallback.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

