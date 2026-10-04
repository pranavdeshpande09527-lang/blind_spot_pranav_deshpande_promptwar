# Third Eye — architecture design

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Implement a single-origin existing vanilla frontend and Express deployment with Supabase handling Auth and database. Browser sends a Supabase bearer token to /api; server verifies identity before queries.
- Use a per-request Supabase client with publishable key and user JWT so RLS applies. Keep migrations and privileged operations outside the public runtime.
- Choose synchronous bounded analysis for the MVP, durable run status and stale-run reconciliation. Do not introduce Redis, workers, vector databases, or independent agents unless a measured requirement warrants them.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

