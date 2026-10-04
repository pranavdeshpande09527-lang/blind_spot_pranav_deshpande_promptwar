# Third Eye — crud

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Implement create/read/list/update/delete decisions plus immutable completed analyses and editable reflection answers. Use expected revision on updates to reject lost writes.
- Paginate owner history with stable created_at/id cursors. Deletion must cascade analyses, sources and reflections in one database operation.
- Return persisted records and real timestamps; never update the UI as successful if the database write failed.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

