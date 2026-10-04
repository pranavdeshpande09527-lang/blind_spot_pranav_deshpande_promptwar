# Third Eye — optimization

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Bound history pagination and output size; fetch selected summaries for lists and detailed output only when opening an analysis.
- Avoid N+1 requests for sources and reflections; cap Tavily results and model context before storage and inference.
- Measure real query latency before adding caches. Any private-data cache must include owner and input revision and honor deletion.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

