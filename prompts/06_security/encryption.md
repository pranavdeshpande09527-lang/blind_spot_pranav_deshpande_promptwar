# Third Eye — encryption

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Use HTTPS for deployed traffic and supported Supabase secure connections. Rely on documented platform storage encryption without inventing custom encryption claims.
- Never place secrets or sensitive decisions in URLs, analytics events or browser logs. Store only data needed for the feature.
- Do not create custom cryptography; document actual transport and platform assumptions.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

