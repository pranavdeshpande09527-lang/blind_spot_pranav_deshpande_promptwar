# Third Eye — input validation

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Validate inputs at every trust boundary using shared schemas. Reject oversized payloads and unknown privileged fields.
- Render model output as escaped text; if markdown is supported use a restrictive sanitizer and reject unsafe URL schemes.
- Keep user instructions and retrieved pages below the fixed reasoning policy; validate citation IDs and quotes after generation.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

