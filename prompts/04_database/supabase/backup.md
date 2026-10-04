# Third Eye — backup

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Document the Supabase project’s actual backup/PITR availability and retention; do not assume a paid feature exists.
- Describe a secure logical export and restore rehearsal into a separate project, including schema, RLS and verification of owner isolation.
- Record recovery steps and explain how deletion interacts with backup retention. Keep dumps and credentials out of source control.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

