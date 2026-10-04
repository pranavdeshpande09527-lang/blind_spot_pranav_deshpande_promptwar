# Third Eye — memory

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Use only the authenticated user’s current decision, selected prior analysis and saved reflection answers as explicit memory.
- Record which snapshot was analyzed and distinguish newly answered questions from unresolved questions. Do not silently pull unrelated decisions into context.
- Deleting a decision deletes its application memory. Bound context size and do not claim the provider forgets data beyond its documented settings.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

