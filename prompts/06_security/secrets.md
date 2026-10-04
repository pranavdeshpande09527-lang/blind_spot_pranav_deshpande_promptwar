# Third Eye — secrets

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Create .env.example containing names and empty placeholders only. Preserve existing .env without printing, copying into docs or committing it.
- Keep GEMINI_API_KEY, GROQ_API_KEY and TAVILY_API_KEY server-side. Only Supabase URL and publishable key may be browser configuration.
- Add .env patterns to .gitignore with an exception for .env.example. Verify production assets contain no private keys; rotate credentials only through an authorized workflow if exposure is confirmed.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

