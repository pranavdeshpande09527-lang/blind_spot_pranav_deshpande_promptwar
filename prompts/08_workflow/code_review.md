# Third Eye — code review

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Review contract consistency, ownership, secret boundaries, output grounding, real error handling and newspaper UI requirements.
- Flag placeholder handlers, fabricated dates/results, stale runs, unbounded retries and mismatch between docs and code.
- Resolve material issues then summarize concrete verification and remaining setup requirements.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

