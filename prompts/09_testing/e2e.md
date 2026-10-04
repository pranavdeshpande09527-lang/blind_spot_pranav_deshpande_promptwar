# Third Eye — e2e

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Exercise sign-in, create decision, analyze, view history, answer a question, reanalyze, refresh and delete.
- Cover mobile layout, keyboard focus, session expiration, provider errors and save failures. A mock-only E2E run must be labeled as such.
- Add a separately runnable live smoke test; do not expose keys in browser tracing or committed recordings.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

