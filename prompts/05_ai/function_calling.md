# Third Eye — function calling

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- If tool calling is used, expose only a server-owned search_public_evidence schema with query and bounded max_results. A simple deterministic search stage is preferred for the MVP.
- Reject unrecognized tools and extra arguments; enforce research opt-in and query redaction outside model control.
- Never let the model choose arbitrary network destinations, SQL, filesystem paths or credentials. Tool failures become explicit research limitations.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

