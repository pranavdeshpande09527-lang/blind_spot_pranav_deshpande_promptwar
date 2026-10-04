# Third Eye — technical doc

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Document source layout, contracts, schema, RLS, provider adapters, timeouts, stale runs, idempotency and known limitations.
- Explain runtime timestamps and the distinction between user statements, model inferences and external evidence.
- Use real code paths and tested commands; omit speculative completed features.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

