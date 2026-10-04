# Third Eye — supabase

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Set up Auth and Postgres, apply versioned migrations and verify RLS with two accounts.
- Configure site URL and recovery/confirmation redirect URLs for local and actual Render origins. Use SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.
- Runtime requests use user JWTs. Privileged migration credentials, if needed, stay outside the public web service and documented public environment.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

