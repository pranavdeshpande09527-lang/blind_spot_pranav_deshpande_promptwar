# Third Eye — services

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Separate decision repository, analysis repository, provider adapters, evidence service and analysis orchestration.
- Capture decision plus reflections in an immutable snapshot, use its revision throughout a run, and persist only schema-validated results.
- Use per-user bounded concurrency and persisted run idempotency. Handle disconnect/restart with deadlines and stale-run reconciliation, not an indefinitely running spinner.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

