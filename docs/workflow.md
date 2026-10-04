# User and implementation workflow

User flow: authenticate → enter existing form fields → save decision → request analysis → inspect summary/assumptions/blind spots/tensions/perspectives/reflection → save answers → reanalyze → revisit history or delete. Each analysis captures the exact input revision and answers available at the time.

Map existing runAnalysis to POST /api/decisions (or PATCH the saved decision), then POST /api/decisions/:id/analyses. Display real loading state while pending. Pass response.output to the existing renderer functions after shared validation. If the HTTP connection is interrupted, look up the durable run with the same idempotency key; do not blindly charge a new request.

Preserve dateStamp runtime formatting. Remove client key entry and direct provider calls during integration. Keep errors visible and retain the form contents; loading always stops on success or failure. Never use demo output as an outage fallback.

Implementation sequence: contracts/config → SQL/RLS/auth → CRUD → Gemini structured output → existing UI wiring → reflection/versioning → optional research/fallback → tests → Render deployment and live verification. The pack preserves optional template topics while explicitly deferring embeddings and Resend.

