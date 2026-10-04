import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readConfig } from '../src/config.js';
import { synthesize, fetchJSON } from '../src/providers.js';
import { decisionSchema, type Snapshot } from '../src/shared/schemas.js';

const config = readConfig({ GEMINI_API_KEY: 'test', GEMINI_MODEL: 'configured-model', GROQ_API_KEY: 'test', GROQ_MODEL: 'configured-fallback' });
const snapshot: Snapshot = { ...decisionSchema.parse({ decision: 'Consider an internship?', context: 'Mentorship matters to me.' }), id: randomUUID(), user_id: randomUUID(), revision: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), reflections: [] };
const valid = { summary: { decision: snapshot.decision, options: 'Unknown', statedGoals: 'Unknown', keyReasons: 'Unknown', explicitConstraints: 'Unknown', affected: 'Unknown' }, assumptions: [], blindspots: [], conflicts: [], perspectives: [], reflection: { topBlindspots: [], strongestAssumptions: [], unansweredQuestions: [], infoToGather: [], assumptionMatrix: [], checklist: [] }, limitations: [] };
test('provider failure classification, bounded fallback, truncation, and malformed output', async () => {
  const original = globalThis.fetch;
  try {
    let calls = 0;
    globalThis.fetch = async () => { calls++; return new Response('{}', { status: 403 }); };
    await assert.rejects(() => synthesize(config,snapshot,[],'not_requested',Date.now()+45000), { code: 'PROVIDER_CONFIGURATION' }); assert.equal(calls,1);
    calls = 0;
    globalThis.fetch = async () => { calls++; return new Response(JSON.stringify({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '{broken' }] } }] })); };
    await assert.rejects(() => synthesize(config,snapshot,[],'not_requested',Date.now()+45000), { code: 'INVALID_PROVIDER_OUTPUT' }); assert.equal(calls,2);
    calls = 0;
    globalThis.fetch = async () => { calls++; return calls === 1 ? new Response('{}', { status: 503 }) : new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(valid) } }] })); };
    const result = await synthesize(config,snapshot,[],'not_requested',Date.now()+45000); assert.equal(result.provider,'groq'); assert.equal(result.model,config.GROQ_MODEL); assert.equal(calls,2);
    calls = 0;
    globalThis.fetch = async () => { calls++; return new Response(JSON.stringify({ candidates: [{ finishReason: 'MAX_TOKENS', content: { parts: [{ text: JSON.stringify(valid) }] } }] })); };
    await assert.rejects(() => synthesize({ ...config, GROQ_API_KEY: '' },snapshot,[],'not_requested',Date.now()+45000), { code: 'INVALID_PROVIDER_OUTPUT' }); assert.equal(calls,2);
    await assert.rejects(() => synthesize(config,snapshot,[],'not_requested',Date.now()-1), { code: 'DEADLINE_EXCEEDED' });
    globalThis.fetch = async () => new Response('x'.repeat(200));
    await assert.rejects(() => fetchJSON('https://example.org',{},1000,100), { code: 'INVALID_PROVIDER_OUTPUT' });
  } finally { globalThis.fetch = original; }
});
