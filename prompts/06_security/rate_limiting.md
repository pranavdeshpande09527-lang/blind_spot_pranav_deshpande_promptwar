# Third Eye — rate limiting

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Enforce per-user analysis limits and a global concurrency bound before provider calls; return 429 with Retry-After.
- For one Render instance, document in-memory limits reset on restart; use persisted analysis timestamps to constrain paid request frequency. Add durable shared limiting before scaling.
- Avoid spoofable client IP trust and prevent automatic retries from multiplying paid calls. Bound provider timeouts and output tokens.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

