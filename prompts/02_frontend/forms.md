# Third Eye — forms

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Preserve f-decision, f-context, f-options, f-reasons, f-constraints, f-affected and f-deadline. Require decision and at least one of context or reasons, matching the current interaction.
- Keep options and deadline as user text; deadline can express a time horizon rather than a machine date. Do not guess a calendar date from ambiguous text. Bound input lengths and show inline errors.
- Add explicit research opt-in, owner-scoped save/history and real reflection inputs. Sample text is input only and must never produce canned results.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

