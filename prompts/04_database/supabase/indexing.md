# Third Eye — indexing

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Index decisions(user_id, created_at desc, id desc), analyses(user_id, decision_id, created_at desc), reflections(user_id, decision_id) and source analysis foreign keys.
- Use a unique owner/decision/idempotency-key constraint and a partial uniqueness constraint for one active run per decision if compatible with the run protocol.
- Verify representative owner queries with EXPLAIN; avoid redundant indexes and blanket indexing of JSON output.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

