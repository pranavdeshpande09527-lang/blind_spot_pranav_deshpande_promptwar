# Third Eye — cors

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Serve frontend and API on the same production origin. Allow only explicitly configured local development origins if needed.
- Do not use wildcard CORS with credentials. Handle preflight correctly and distinguish CORS from authentication.
- Set APP_ORIGIN from deployment configuration; configure Supabase auth redirect URLs to the exact approved origins.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

