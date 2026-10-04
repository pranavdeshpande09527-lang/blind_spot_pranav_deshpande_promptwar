# Third Eye — render

## Required context

Read README.md, prompts/00_master/project_context.md, prompts/00_master/coding_rules.md, docs/contracts.md and docs/api.md from the project root before implementing this task. Inspect existing code first. The current request is to prepare prompts; these instructions guide the later application implementation.

## Task

- Create render.yaml for one Node web service: build npm ci && npm run build, start npm start, healthCheckPath /healthz and environment secrets supplied through Render.
- The server serves the existing frontend and any bundled browser assets and binds 0.0.0.0 to Render’s PORT. Persist data only in Supabase, never the ephemeral filesystem.
- Document APP_ORIGIN and Supabase redirects after the actual hostname exists. Verify cold start and live analysis within timeouts; do not claim a deployed URL before testing.

## Completion requirements

Deliver the task’s concrete implementation or documented scope decision, with actual verification appropriate to its risk. Keep the existing frontend design. Follow the canonical contracts; if a contract must change, update all affected implementations and documentation together. Report missing credentials, failed checks and untested deployment steps honestly. Never hardcode dates, fabricate data or choose a decision for the user.

