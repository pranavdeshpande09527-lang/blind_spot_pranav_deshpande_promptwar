# Third Eye — feature breakdown

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Prioritize P0: sign-in, editable decision input, save/list/delete, live analysis, stored analysis versions, follow-up answers, loading/error/empty states, mobile accessibility, deployment.
- P1: opt-in Tavily evidence and Groq fallback when configured. P2: exports, advanced memory, embeddings, email and dashboards; do not build these at the expense of P0.
- Every visible control must work. Optional integrations must show their actual availability. Sample input may populate a form only after a user action; analysis must still call the live backend.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

