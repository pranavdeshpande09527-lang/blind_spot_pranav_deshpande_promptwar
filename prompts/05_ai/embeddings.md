# Third Eye — embeddings

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Do not add embeddings or a vector store to the three-hour MVP: there is no supplied corpus and decision-scoped SQL plus bounded web retrieval is sufficient.
- If later justified, first document the corpus, consent, chunking, owner-filtered retrieval and deletion path; add embeddings only behind a separately tested migration.
- For this task deliver a recorded design decision explaining why no embedding dependency or mock vectors are shipped.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

