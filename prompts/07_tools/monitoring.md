# Third Eye — monitoring

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Log request ID, route, status, duration, provider/model and sanitized error code; avoid prompts, tokens and sensitive narratives.
- Expose lightweight /healthz with no paid AI calls. Track actual analysis failures and latency, distinguishing research degradation from complete failure.
- Document where Render logs and Supabase logs can be inspected and how to investigate an incident using request IDs.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

