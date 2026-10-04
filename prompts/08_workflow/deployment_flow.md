# Third Eye — deployment flow

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Run typecheck/test/build, apply and verify Supabase migrations, configure environment, deploy the Render service and set auth redirect URLs.
- Check /healthz and the browser workflow at the public hostname using a real account and live provider request.
- Confirm saved decisions survive refresh, reflection reanalysis works and deletion persists. Record the actual URL and observed results.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

