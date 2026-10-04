# Third Eye — prompt template

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Assemble the runtime prompt from the fixed llm_prompt, JSON schema, server-generated current_time_utc, decision_snapshot and evidence records.
- Serialize user content as a data block; never interpolate it into the system role. Include the actual snapshot revision and reflection IDs for traceability.
- Inject current time at request execution, not as a literal calendar date. Pass no secrets, other users’ data or fabricated example output into production requests.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

