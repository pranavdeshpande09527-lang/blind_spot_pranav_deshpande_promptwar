# Third Eye — api testing

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Verify all docs/api.md routes: valid responses, invalid bodies, absent/expired tokens, cross-owner IDs, 404, 409, 429 and provider failures.
- Test repeated Idempotency-Key with matching and different input revisions; ensure no duplicate charged run on ordinary replay.
- Check pagination stability, cascade deletion and that unknown /api routes never return frontend HTML.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

