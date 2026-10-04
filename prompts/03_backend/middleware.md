# Third Eye — middleware

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Implement request IDs, JSON size limit, auth, explicit origin policy, rate limiting and a centralized redacted error handler.
- Return machine-readable codes and safe messages; log route, request ID, latency and provider outcome rather than user narratives or bearer tokens.
- Configure proxy trust for the actual Render topology, not blanket trust of arbitrary forwarded headers.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

