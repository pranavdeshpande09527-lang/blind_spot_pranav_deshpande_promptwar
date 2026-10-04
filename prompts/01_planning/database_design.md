# Third Eye — database design

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Implement the exact tables and ownership rules in docs/contracts.md. Decision revision and input snapshots keep prior analyses interpretable after edits.
- Enforce ownership both in RLS and relationship constraints: analysis and reflections must belong to the same decision owner. Index owner and chronological access paths.
- Use database-generated IDs/timestamps, cascade child deletion, and guarded analysis state transitions. Never accept user_id or completed status from the browser.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

