# Third Eye — ai integration

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Use Gemini as primary with GEMINI_MODEL=gemini-3.5-flash configurable. Validate access using a real development call; surface unavailable model errors rather than silently changing its name.
- Groq is optional fallback only when GROQ_API_KEY and GROQ_MODEL are set and verified. Use the same output schema and record actual provider/model; never confuse Groq with Grok.
- Use structured output where supported and always validate server-side. Cap output, retry only transient failures within deadline, and allow at most one schema repair before returning an honest error.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

