# Third Eye — testing

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Prioritize owner isolation, persistence, valid structured AI output, malformed provider handling, no recommendation behavior and frontend state transitions.
- Use deterministic provider stubs only in tests; run separately labeled live integration smoke checks when credentials exist.
- Report passed, failed and unrun checks separately. Do not characterize an unexecuted deployment as ready.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

