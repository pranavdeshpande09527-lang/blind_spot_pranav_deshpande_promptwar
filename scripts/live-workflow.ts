import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { createClient } from '@supabase/supabase-js';
import { createApp } from '../src/app.js';
import { readConfig } from '../src/config.js';
import { decisionSchema, type Analysis, type Decision } from '../src/shared/schemas.js';

const config = readConfig();
if (!process.env.TEST_EMAIL || !process.env.TEST_PASSWORD) {
  console.log('Live workflow requires TEST_EMAIL and TEST_PASSWORD for a confirmed test account. No records were created.'); process.exit(1);
}
const client = createClient(config.SUPABASE_URL,config.SUPABASE_PUBLISHABLE_KEY,{ auth:{ persistSession:false } });
const { data: login, error: loginError } = await client.auth.signInWithPassword({ email:process.env.TEST_EMAIL,password:process.env.TEST_PASSWORD });
if (loginError || !login.session) { console.log(JSON.stringify({check:'test_sign_in',status:loginError?.status,code:loginError?.code || 'NO_SESSION'})); process.exit(1); }
const server = createApp(config).listen(0,'127.0.0.1'); await once(server,'listening');
const origin = `http://127.0.0.1:${(server.address() as { port:number }).port}`;
let decisionId: string | undefined;
async function request<T>(path: string, method='GET', body?: unknown, headers: Record<string,string>={}, status=200): Promise<T> {
  const response = await fetch(origin+'/api'+path,{ method,headers:{ Authorization:`Bearer ${login.session!.access_token}`,'Content-Type':'application/json',...headers },...(body ? {body:JSON.stringify(body)} : {}) });
  const value = await response.json();
  if (response.status !== status) throw new Error(`Expected ${status}, received ${response.status}: ${value.error?.code || 'unexpected response'}`);
  return value.data;
}
try {
  const cases = JSON.parse(await readFile('tests/evaluation-cases.json','utf8'));
  const { name, ...input } = cases[0]; const fields = decisionSchema.parse(input);
  const d = await request<Decision>('/decisions','POST',fields,{},201); decisionId = d.id;
  assert.equal((await request<Decision>(`/decisions/${d.id}`)).decision,d.decision);
  const history = await request<{ items: Decision[] }>('/decisions'); assert.ok(history.items.some(item=>item.id===d.id));
  const updated = await request<Decision>(`/decisions/${d.id}`,'PATCH',{...fields,expectedRevision:d.revision});
  await request(`/decisions/${d.id}`,'PATCH',{...fields,expectedRevision:d.revision},{},409);
  const key = randomUUID();
  const analysis = await request<Analysis>(`/decisions/${d.id}/analyses`,'POST',{expectedRevision:updated.revision},{'Idempotency-Key':key},201);
  assert.equal(analysis.status,'completed');
  const replay = await request<Analysis>(`/decisions/${d.id}/analyses`,'POST',{expectedRevision:updated.revision},{'Idempotency-Key':key}); assert.equal(replay.id,analysis.id);
  const reloaded = await request<Analysis>(`/decisions/${d.id}/analyses/${analysis.id}`); assert.deepEqual(reloaded.output,analysis.output);
  const denied = await client.from('analyses').update({status:'failed'}).eq('id',analysis.id); assert.ok(denied.error);
  if (analysis.questions[0]) {
    const result = await request<{ decisionRevision:number }>(`/decisions/${d.id}/reflections/${analysis.questions[0].id}`,'PUT',{analysisId:analysis.id,answer:fields.context,expectedRevision:updated.revision});
    const reanalysis = await request<Analysis>(`/decisions/${d.id}/analyses`,'POST',{expectedRevision:result.decisionRevision},{'Idempotency-Key':randomUUID()},201);
    assert.equal(reanalysis.input_snapshot.reflections.length,1);
    console.log(JSON.stringify({check:'live_reflection_reanalysis',passed:true,provider:reanalysis.provider}));
  } else console.log('Live reflection check skipped: no questions were generated.');
  console.log(JSON.stringify({check:'live_authenticated_workflow',passed:true,provider:analysis.provider,model:analysis.model}));
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Live workflow failed.'); process.exitCode=1;
} finally {
  if (decisionId) {
    try {
      await request(`/decisions/${decisionId}`,'DELETE'); await request(`/decisions/${decisionId}`,'GET',undefined,{},404);
      const { data, error } = await client.from('analyses').select('id').eq('decision_id',decisionId); assert.equal(error,null); assert.deepEqual(data,[]);
      console.log('Test-owned decision deleted; cascade verified.');
    } catch { console.error('Test cleanup failed. Remove only this test-owned decision from the account archive.'); process.exitCode=1; }
  }
  await client.auth.signOut(); server.closeAllConnections(); server.close();
}
