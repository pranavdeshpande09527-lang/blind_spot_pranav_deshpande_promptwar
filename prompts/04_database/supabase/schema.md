# Third Eye — schema

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Write executable SQL migrations implementing docs/contracts.md, not merely a schema description. Enable RLS on every public table and create explicit policies for each supported operation.
- Constrain status enums, revisions, JSON shapes at appropriate boundaries, and parent/owner consistency. Use database-generated timestamps with update triggers.
- Prevent client modification of immutable completed runs through privileges/policies and narrowly scoped validated RPCs where needed. Test access with actual user JWTs.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

