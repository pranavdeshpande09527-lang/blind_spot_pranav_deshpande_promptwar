# Third Eye — ai testing

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Evaluate varied decision inputs and ensure findings reference the actual reasoning, use tentative language, and never select an option.
- Test prompt injection in decision text and search snippets, fabricated citation IDs, non-JSON output, truncation and empty results.
- Compare with and without reflection answers; previously resolved uncertainty should not be repeated as overlooked. Record real test outcomes without invented accuracy percentages.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

