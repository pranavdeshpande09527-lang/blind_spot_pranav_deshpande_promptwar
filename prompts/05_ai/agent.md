# Third Eye — agent

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Implement a bounded orchestration function: validate snapshot, optionally retrieve evidence, call the model, validate result, persist result, return response.
- Use one primary synthesis call plus at most one repair or fallback path under a shared deadline; no self-directed tool loops or multi-agent voting.
- The workflow cannot submit forms externally, contact people, execute arbitrary code or act on the decision. It produces questions and evidence only.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

