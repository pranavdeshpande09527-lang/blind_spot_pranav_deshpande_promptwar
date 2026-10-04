# Third Eye — integration tests

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Use a separate Supabase test project or local instance with migrations and two accounts. Verify CRUD, RLS, parent ownership, idempotency and revision conflicts.
- Stub provider transport for failure cases while exercising real route/repository logic. Test restart-like stale processing recovery.
- Clean up only test-owned records; never reset a user’s database.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

