# Third Eye — rag

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Implement lightweight optional retrieval through Tavily for unresolved factual questions only when research is enabled. Core introspection must function without a dataset or search.
- Generate up to 2 generalized queries, removing names, contact details and sensitive narrative; fetch up to 3 results per query and deduplicate canonical URLs.
- Treat snippets as untrusted evidence, preserve title/URL/retrieved_at and limitations, and cite only source IDs passed by the server. Search results do not establish user-specific facts.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

