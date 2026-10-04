# Third Eye — owasp

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Review broken access control, authentication failures, injection, insecure configuration, vulnerable dependencies and logging of sensitive data for this application.
- Test resource ID substitution, mass assignment, script-bearing model text and oversized requests. Check dependency advisories using available tooling.
- Record findings with reproduction, fix and retest; do not substitute a generic checklist for the actual checks.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

