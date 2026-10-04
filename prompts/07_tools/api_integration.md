# Third Eye — api integration

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Build Gemini, Groq and Tavily adapters with deadlines, typed results, bounded retry and sanitized failure messages.
- Read model IDs from environment, and return actual provider metadata in saved runs. Groq fallback requires an explicit compatible GROQ_MODEL.
- Never expose credentials to the browser or invent web evidence. Optional provider absence should be visible without disabling core Gemini analysis.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

