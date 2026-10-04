# Third Eye — resend

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Resend is outside MVP scope because no RESEND_API_KEY or transactional-email requirement was supplied. Use Supabase Auth’s configured email flow.
- Do not add a fake email form, mocked delivery status or mandatory Resend dependency.
- Document any real Supabase email delivery limits discovered during setup and optional SMTP configuration as a follow-up.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

