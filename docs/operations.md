# Operations, security, and recovery

## Identity and database boundaries

Express verifies bearer tokens with Supabase `auth.getUser`, then creates a request-scoped client using that JWT and the publishable key. Reads use owner filters and RLS. Ordinary clients have SELECT privileges only; mutations use narrow owner-checking SECURITY DEFINER functions with empty search paths and restricted execution grants. No service-role runtime client exists.

`ANALYSIS_SIGNING_SECRET` is a server-only capability required by run creation/finalization functions. Only its SHA-256 digest is stored in a private schema. A user with their own JWT cannot forge completed results or bypass paid-run accounting. Database tests cover invalid capabilities and denial of direct mutations. Keep SQL/dashboard access privileged. Rotate the server credential and stored digest together.

Sources and output commit atomically. Deletion during inference cannot recreate a deleted parent. Run creation locks the decision and serializes owner rate checks. Readers/new runs expire stale processing rows. The browser stores only durable run IDs/keys in session storage to recover interrupted requests. Terminal results are immutable. A server timeout cannot guarantee the provider did not charge for work already performed.

## Application controls and residual limits

JSON bodies are limited to 64 KB; mutation schemas reject unknown fields. Output has a shared schema and 64 KB serialized bound; quotes must match snapshot text and source IDs must belong to the run. Only HTTP(S) evidence links render. User/model text is escaped; CSP restricts scripts and network destinations. Prompt injection remains a model-behavior risk despite role separation and validation.

API origins must match `APP_ORIGIN`. Production trusts one proxy hop for the intended Render topology; review this if adding a proxy/CDN. General rate and concurrency limits are process-local; hourly paid-run limits are persisted. Use a single instance until shared concurrency controls exist. Only the latest 16 answers for a decision enter each snapshot, and reflection reads return up to 200 saved answers.

## Monitoring

`/healthz` proves process liveness only. Logs include request ID, route template, status, elapsed time, analysis ID, provider/model, and safe error codes; they omit narratives, tokens and keys. Correlate user-visible reference IDs with Render logs. Use restricted Supabase Auth/Postgres logs for database incidents. Missing tables or mismatched lifecycle credentials surface safe setup errors.

## Backups and restoration

The hosted project's plan, automatic backup retention, PITR availability, and encryption settings have not been inspected. Check Supabase Database → Backups and billing before relying on them. Do not assume paid recovery features exist.

Use a privileged short-lived database connection for logical exports into protected storage outside the repository. Never commit dumps or database passwords. Restore into a separate disposable project, reconcile auth user IDs, install private configuration, and rerun two-account isolation, reads, revisions, and deletion checks. No hosted restore rehearsal or query-plan benchmark has been performed.

Deletion removes current application rows and children. Platform backups and provider retention follow their respective policies; application deletion does not promise removal from those systems.

## Releases and incidents

Run typecheck/tests/build/browser checks before release. Apply migrations deliberately; web startup does not migrate. Migration 0001 is a transactional baseline. Prefer forward migrations that preserve records; never use DROP TABLE to hide schema mismatches. Roll back application code only when compatible with the current schema.

Gemini failure is a failed run unless an eligible configured fallback succeeds within the two-attempt budget. Research failure allows explicitly labeled reasoning-only output. Database failure never displays a successful save. Revisit status/history to reconcile runs after a restart. Replace invalid/disabled keys through the provider console, update the server environment, restart, and rerun the live check.
