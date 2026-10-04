# Third Eye

A newspaper-style application for examining decisions, assumptions, uncertainties, and reasoning tensions. Save a decision, generate live analysis, answer follow-up questions, and revisit prior versions. The original HTML/CSS design is preserved. Third Eye does not choose, rank, or score your options.

All application records, dates, questions, results, and sources come from user inputs, PostgreSQL, runtime clocks, or actual provider responses. There are no production seed records, canned analyses, or fake outage fallbacks. Fixtures live only in `tests/`.

## Run

Requires Node 22+ (Node 24 recommended), Supabase, and a working Gemini key/model.

```sh
npm ci
npm run build
npm start
```

Open http://localhost:3000. `npm run dev` watches the server; run `npm run build` after browser source edits. Your existing `.env` is preserved. The ignored `.env.local` holds an additional random local server credential. Process environment values take precedence over files.

## Install the Supabase database

In the intended project's SQL Editor, run these files in order:

1. `supabase/migrations/0001_third_eye.sql` — tables, constraints, RLS, indexes, and transactional functions. Run once on a new application schema. Do not drop existing data to resolve a conflict.
2. `supabase/setup-local.sql` — installs the SHA-256 digest matching this checkout's `.env.local` analysis credential. This machine-specific file is ignored by Git; it contains a hash, not the secret.

Set Authentication → URL Configuration to the application origin and allow that URL for confirmation/recovery redirects. Enable email/password authentication. The UI handles projects that require email confirmation; delivery uses Supabase's configured email system.

Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `.env`. The existing `Supabase_url` spelling is accepted as an alias. A publishable key cannot execute migrations; use the SQL Editor or a privileged migration connection. The web application does not use a service-role key.

For another checkout/deployment, generate a random secret of at least 32 characters, set `ANALYSIS_SIGNING_SECRET`, and install its SHA-256 digest through a privileged SQL session:

```sql
insert into private.runtime_config(key,value)
values ('analysis_secret_hash', '<SHA-256 hex digest of your server secret>')
on conflict(key) do update set value=excluded.value;
```

Never put the raw secret in a public table, browser code, or committed file. The local setup file is already prepared for this checkout; do not regenerate it independently of the server secret.

## Environment

See `.env.example`. Production requires `APP_ORIGIN` (exact HTTPS origin), `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `GEMINI_API_KEY`, `GEMINI_MODEL`, and `ANALYSIS_SIGNING_SECRET`. Only the Supabase public configuration is sent to the browser.

Optional `GROQ_API_KEY` plus `GROQ_MODEL` enables one fallback attempt for transient or invalid-output failures. Authentication/configuration errors are surfaced immediately. `TAVILY_API_KEY` enables opt-in public research. Configuration presence does not prove model access; run the live check. The configured Gemini model is never silently changed.

Defaults: 45-second analysis budget, 18-second provider calls, at most two synthesis attempts, 12 analyses per user per hour, three concurrent analyses per process, one active analysis per user per process and per decision in PostgreSQL. Paid-run frequency survives restarts. Use one instance until shared concurrency control is added.

## Check

```sh
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:live
```

Unit/integration tests execute real PostgreSQL through PGlite, including two database identities, RLS, revisions, idempotency, terminal states, expiry, and deletion. They also check schemas, quote/source validation, HTTP boundaries, provider failures, and OpenAPI endpoint coverage.

Browser tests cover desktop/mobile layouts. The complete account/save/analyze/reflection/delete workflow uses explicitly mocked test API responses. It does not prove hosted Supabase authentication or live model quality.

`test:live` sends a test-only evaluation input to the configured AI and checks Supabase availability without seeding records. Set `TEST_EMAIL` and `TEST_PASSWORD` for an existing test account to enable its authenticated read check. `npm run test:live -- --all` runs eight evaluation cases and can incur provider usage. Human review is still needed for neutrality and usefulness. See `docs/verification.md` for observed results.

## Render deployment

`render.yaml` defines one Node service, build `npm ci && npm run build`, start `npm start`, health `/healthz`. Connect an actual Git repository to Render, provide the required environment, and use the secret whose hash is installed in that database. Set `APP_ORIGIN` and Supabase redirects to the actual hostname.

Apply migrations and verify sign-in, two-account isolation, live analysis, reflection reanalysis, refresh, and deletion at the public URL before enabling traffic. No public deployment or Git push is claimed; a Git remote and Render account are not configured in this workspace.

## Documentation and limits

See `docs/contracts.md`, `docs/api.md`, generated `docs/openapi.json`, `docs/architecture.md`, `docs/operations.md`, and `docs/prompt-coverage.md`.

New analysis includes only the current decision and its 16 most recently updated saved answers. Search sends allowlisted public concepts, never raw private narrative; research is marked partial if a safe generalized query cannot be derived. Valid source IDs establish membership, not factual correctness. Provider-generated language can still be imperfect. There is no numeric confidence or option scoring.
# blind_spot_pranav_deshpande_promptwar
