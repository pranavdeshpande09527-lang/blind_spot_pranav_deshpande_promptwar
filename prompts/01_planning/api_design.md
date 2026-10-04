# Third Eye — api design

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Implement docs/api.md with shared Zod schemas, bearer authentication, consistent errors, cursor pagination and idempotent analysis requests.
- Define bounded field lengths, input revision conflicts, analysis timeouts and capability availability. Use 404 for absent or inaccessible resources.
- Generate an OpenAPI specification from the implemented contract or keep it checked against route tests; document actual payloads and provider errors.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

