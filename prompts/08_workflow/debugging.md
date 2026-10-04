# Third Eye — debugging

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Reproduce the failure with a request ID and minimal sanitized input. Determine whether it is configuration, auth, RLS, provider, schema, network or UI state.
- Inspect safe logs and exact error codes; do not expose .env or entire decision text to debug output.
- Fix the cause, add an appropriate regression check and verify the original path; never hide errors behind sample data.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

