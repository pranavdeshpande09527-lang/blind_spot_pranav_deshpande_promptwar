# Third Eye — secure deployment

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Deploy with validated server environment, HTTPS, exact auth redirect configuration and no secrets in frontend bundles.
- Run migrations and RLS checks before enabling traffic. Restrict logs and return sanitized errors in production.
- Verify health, login, owner isolation, live analysis, persistence and deletion at the actual public link.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

