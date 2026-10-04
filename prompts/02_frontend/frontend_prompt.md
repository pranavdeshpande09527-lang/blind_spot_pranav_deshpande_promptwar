# Third Eye — frontend prompt

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Integrate the existing index.html; do not rebuild or replace its visual design. Keep existing form IDs, CSS, newspaper layout and renderer functions where compatible.
- Replace browser callGemini and the API-key entry bar with authenticated backend calls and appropriate account controls. Move buildPrompt to the server; remove forced minimum counts that fabricate findings.
- Wire existing runAnalysis to save a decision then request analysis and pass validated output to renderSummary, renderAssumptions, renderBlindspots, renderConflicts, renderPerspectives and renderReflection. Add only missing auth/history/reflection/research controls using the established style.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

