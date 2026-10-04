# Third Eye — authorization

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Apply owner-only access to every decision, analysis and reflection. Derive the owner from the verified token and never request an arbitrary owner from the client.
- Use user-scoped Supabase clients so RLS remains active. Test two distinct accounts, child relationships, list access and mutation access.
- Use 404 for cross-owner IDs and deny anonymous database access. Do not expose a service-role client to ordinary request handlers.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

