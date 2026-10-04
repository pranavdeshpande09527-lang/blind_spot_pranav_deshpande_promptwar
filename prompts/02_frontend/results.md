# Third Eye — results

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Render validated structured output as readable newspaper sections. Attach each inferred finding to an exact input quote or explicitly mark it as missing information.
- Show potential importance without numeric confidence or decision scores; communicate that importance is qualitative. Evidence links must correspond to server-provided sources.
- Allow answering reflection questions, saving answers, and requesting a new analysis. Identify provider/model, actual generation time, incomplete research and stale input revision without distracting technical clutter.
- Preserve renderer key names: summary, assumptions, blindspots, conflicts, perspectives and reflection. Add grounding metadata through the shared schema. Turn decorative checklist boxes into actual accessible checkboxes if interactive.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

