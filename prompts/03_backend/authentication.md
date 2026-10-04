# Third Eye — authentication

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Use Supabase email/password authentication for the MVP, with sign-up, sign-in, sign-out and session restoration. Explain confirmation-required state based on actual project settings.
- Verify bearer tokens server-side using supported Supabase verification APIs such as auth.getClaims or auth.getUser; never trust decoded unverified claims.
- Handle expired sessions and recovery links using configured APP_ORIGIN/redirect allowlists. Do not require a separate email vendor.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

