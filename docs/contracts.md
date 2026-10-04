# Canonical product, data and AI contracts

This file resolves cross-prompt choices. Preserve the existing vanilla frontend and renderer vocabulary. Third Eye helps users examine reasoning without choosing for them. No fixed dates, production seed decisions, fabricated evidence, fake provider outputs, winner labels or option scoring.

## Decision input

Strings: decision (1–2000 characters), context/reasons (0–12000 each), options/constraints/affected (0–4000 each), deadline (0–500). Require at least context or reasons. researchEnabled defaults false. Preserve options and time horizon as prose. UUID owner comes only from verified auth. All records use generated UUIDs and UTC timestamptz. Date formatting uses the browser locale/timezone; the model receives server current_time_utc at runtime.

## Database

- decisions: id PK, user_id FK auth.users, the eight editable fields above, revision integer >=1, created_at, updated_at; UNIQUE(id,user_id).
- analyses: id PK, decision_id/user_id composite FK to decisions(id,user_id) ON DELETE CASCADE; input_revision, input_snapshot jsonb (decision fields plus reflection answers), idempotency_key UUID, status processing|completed|failed, output jsonb nullable, provider/model nullable until used, research_status not_requested|unavailable|completed|partial|failed, safe error_code, created_at/started_at/expires_at/completed_at. UNIQUE(user_id,decision_id,idempotency_key); UNIQUE(id,decision_id,user_id). Enforce one processing run per decision with a partial unique index. Completion and failure are terminal.
- sources: id UUID PK, analysis_id/decision_id/user_id composite FK to analyses, title, url, excerpt, retrieved_at. Store only bounded retrieved excerpts, no full scraped pages. A source referenced by output must belong to that analysis.
- reflections: id UUID PK, decision_id/user_id composite FK, analysis_id associated with that decision and owner, question_id text, answer text, created_at, updated_at; UNIQUE(analysis_id,question_id,user_id). Delete cascades from decision/analysis.

Enable RLS on every public table. SELECT/INSERT/UPDATE/DELETE policies constrain user_id to auth.uid() as applicable; enforce WITH CHECK for inserted/updated ownership. Grant only necessary operations. Use narrow owner-validating transactional RPCs for revision updates, reflection upserts, run creation/expiry/finalization and source/result commits when REST requests cannot provide atomicity. Prefer invoker functions; if a definer function is necessary, set a safe search_path, validate auth.uid(), revoke PUBLIC execution and grant only authenticated execution. Do not trust browser-set completed status or arbitrary ownership. Completed analyses are immutable through supported app routes; restrict direct table mutations where the design requires server-controlled lifecycle. Never expose a service-role key. Explain and test any server-only lifecycle credential/function design before adding it.

All output/source inserts commit together after validation. No network inference inside transactions. Bound overall run time with expires_at; readers reconcile stale processing state so restart failures do not block future requests. Snapshot acquisition and revision checking must be atomic. Deletion during inference prevents recreating deleted records.

## Provider output schema

Use Zod plus provider JSON schema. Preserve existing renderer properties exactly:

- summary: {decision,options,statedGoals,keyReasons,explicitConstraints,affected}: all strings. Restate provided information and mark missing fields as unknown; do not invent goals.
- assumptions: array of {category,text,explanation,question,warn,grounding}. category is one of Unstated Assumption, Uncertain Assumption, Needs Evidence, Emotional / Social, Short-term vs Long-term, Confirmation Bias. warn is boolean, never a verdict.
- blindspots: array of {section,factor,why,relatesTo,question,priority,grounding}. section is one of WHAT MAY BE MISSING, WHO ELSE IS AFFECTED, LONG-TERM IMPACT, PRACTICAL RISKS, EMOTIONAL FACTORS, ALTERNATIVE PERSPECTIVES, TRADE-OFFS NOT YET CONSIDERED. priority is low|medium|high for attention, not option ranking.
- conflicts: array of {headline,description,grounding}; conflict must link two actual parts of the input or explicitly describe conditional tension.
- perspectives: array of {label,questions:string[]}; labels Future Self, Person Affected, Risk-Focused, Opportunity-Focused, Neutral Observer.
- reflection: {topBlindspots:string[], strongestAssumptions:string[], unansweredQuestions:string[], infoToGather:string[], assumptionMatrix:{assumption,ifTrue,ifFalse}[], checklist:string[]}.
- limitations: string[] explaining sparse context or evidence limits. research status/provider/time are server metadata, not model-generated facts.

Each grounding: {kind:"user_statement"|"inference"|"missing_information", inputQuotes:{field,quote}[], sourceIds:string[]}. Quotes must occur verbatim in the named snapshot field, including declared reflection-answer fields where applicable; reject otherwise. Allow empty inputQuotes for explicit missing_information. sourceIds must match server-owned retrieved records. Validate URLs at the server (http/https only) and render as safe external links. Source relevance still needs evaluation; source-ID validity alone does not prove the claim.

Use 0–8 assumptions, 0–10 blindspots, 0–5 conflicts, 0–5 perspectives with up to 3 questions each, up to 3 topBlindspots and up to 8 other reflection items per list. Allow empty sections and show an honest empty state. Never force minimum counts like the current buildPrompt does. Bound individual generated text fields to 2000 characters and total serialized output to 64 KB.

After validation, the server assigns stable question IDs and returns a questions array in the Analysis envelope: {id,path,text} for actionable questions. Store this mapping with the completed run so IDs remain stable on reload. Reflection answers refer to this mapping, not model-generated database IDs.

## Inference protocol

Implementation additions: analyses store the server-assigned `questions` array as JSON; reflections store `question_text`. Snapshot memory includes the 16 most recently updated reflection answers for that decision; reflection reads return at most 200 answers. `ANALYSIS_SIGNING_SECRET` is a server-only capability for lifecycle RPCs, with its digest stored in `private.runtime_config`. Application tables grant authenticated clients SELECT only; mutations use owner-checking SECURITY DEFINER functions with empty search paths and explicit execution grants. Local PostgreSQL tests exercise direct-mutation denial, owner isolation, capability checks, and terminal states. No service-role runtime credential is used.

Use configured Gemini primary and optional verified Groq fallback. Server owns fixed system policy, snapshot, current time and evidence records. User/retrieved text is data and cannot change policy. Request only concise findings and rationale, never hidden chain-of-thought. One primary inference plus at most one repair or fallback within the overall default 45-second budget; individual calls default to 18 seconds or remaining budget, whichever is smaller. Do not retry authentication/configuration errors. If output remains invalid, store failure and return a safe error; do not repair with canned content.

Tavily is opt-in. Use at most two generalized public factual queries with up to three results each, deduplicate and preserve real retrieval timestamps. Queries must omit private identifying details; skip research that cannot be safely generalized. Research failure may yield a reasoning-only analysis explicitly labeled with that limitation. Gemini failure with no working fallback yields a failed analysis, not a fabricated success.

## Frontend compatibility

Preserve f-decision/context/options/reasons/constraints/affected/deadline, examineBtn, dateStamp and the existing rendering functions. Replace apiKey/apiStatus UI with account/service state; provider keys are server-owned. runAnalysis saves current inputs then invokes the authenticated API. Replace buildPrompt/callGemini client code with backend integration. Keep esc or equivalent safe rendering, enforce enum-derived CSS classes and safe link schemes. Preserve current layout while adding history, saved answers and real checkbox behavior.
