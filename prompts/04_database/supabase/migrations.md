# Third Eye — migrations

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Create sequential versioned SQL migrations under supabase/migrations. Apply them to a disposable development project first.
- Use transactional changes where supported, explicit indexes/policies, and documented rollback or forward recovery. Never drop existing data to hide a mismatch.
- Separate baseline schema from optional future features. Production migrations are a deliberate release step, not something every web process executes at startup.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

