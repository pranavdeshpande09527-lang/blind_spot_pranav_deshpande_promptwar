# Third Eye — unit tests

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Test request/schema boundaries, date formatting with an injected clock, output validation, quote/source membership and retry classification.
- Use a fake clock to test timeout transitions and stale-run cleanup. Test that one bad citation cannot be saved as verified evidence.
- Keep fixtures under tests only and do not assert exact probabilistic model prose.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

