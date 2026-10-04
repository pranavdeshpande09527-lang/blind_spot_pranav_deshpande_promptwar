import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { readConfig } from '../src/config.js';
import { decisionSchema, type Snapshot } from '../src/shared/schemas.js';
import { synthesize } from '../src/providers.js';
import { createClient } from '@supabase/supabase-js';

const config = readConfig();
let failed = false;
try {
  const response = await fetch(`${config.SUPABASE_URL}/rest/v1/decisions?select=id&limit=0`, { headers: { apikey: config.SUPABASE_PUBLISHABLE_KEY }, signal: AbortSignal.timeout(10000) });
  const value = await response.json();
  console.log(JSON.stringify({ check: 'supabase_schema', status: response.status, code: value.code || null }));
  // Anonymous access must be denied, but a missing relation is a setup failure.
  if (response.status === 404 || response.ok) failed = true;
} catch { console.log('Supabase connection failed.'); failed = true; }
const cases = JSON.parse(await readFile('tests/evaluation-cases.json', 'utf8'));
const chosen = process.argv.includes('--all') ? cases : cases.slice(0, 1);
for (const item of chosen) {
  const { name, ...input } = item;
  const snapshot: Snapshot = { ...decisionSchema.parse(input), id: randomUUID(), user_id: randomUUID(), revision: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), reflections: [] };
  try {
    const started = Date.now();
    const result = await synthesize(config, snapshot, [], 'not_requested', started + config.ANALYSIS_TIMEOUT_MS);
    console.log(JSON.stringify({ check: 'live_analysis', case: name, provider: result.provider, model: result.model, durationMs: Date.now() - started, assumptions: result.output.assumptions.length, blindspots: result.output.blindspots.length, schemaAndGrounding: 'passed' }));
  } catch (error) { console.log(JSON.stringify({ check: 'live_analysis', case: name, code: (error as { code?: string }).code || 'FAILED' })); failed = true; }
}
if (process.env.TEST_EMAIL && process.env.TEST_PASSWORD) {
  const client = createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email: process.env.TEST_EMAIL, password: process.env.TEST_PASSWORD });
  if (error || !data.session) { console.log('Test account sign-in failed.'); failed = true; }
  else {
    const { data: rows, error: readError } = await client.from('decisions').select('id').limit(1);
    console.log(JSON.stringify({ check: 'authenticated_database', passed: !readError, recordsReturned: rows?.length || 0 }));
    if (readError) failed = true;
    await client.auth.signOut();
  }
} else console.log('Live authenticated database check skipped: TEST_EMAIL and TEST_PASSWORD are not configured.');
process.exitCode = failed ? 1 : 0;
