# Third Eye — architecture doc

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Describe browser → Express → Supabase and AI/search providers, including which data crosses each boundary.
- State why one Render service and SQL-scoped memory fit the three-hour constraint. Document optional dependencies and failure paths.
- Keep architecture aligned with actual code and identify deferred features explicitly.
- The existing vanilla index.html is the frontend source of truth; no framework rewrite is required.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

