import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { readConfig } from '../src/config.js';

const app = createApp(readConfig({ NODE_ENV: 'test', GEMINI_API_KEY: 'test-private-key', APP_ORIGIN: 'http://localhost:3000' }));
test('health and config never expose provider keys', async () => {
  assert.deepEqual((await request(app).get('/healthz').expect(200)).body, { status: 'ok' });
  const response = await request(app).get('/api/config').expect(200);
  assert.equal(response.body.data.analysisAvailable, false);
  assert.ok(!response.text.includes('test-private-key'));
});
test('private routes reject missing bearer tokens and foreign origins', async () => {
  const response = await request(app).get('/api/decisions').expect(401);
  assert.equal(response.body.error.code, 'UNAUTHENTICATED'); assert.ok(response.body.error.requestId);
  await request(app).post('/api/decisions').set('Origin', 'https://attacker.invalid').send({}).expect(403);
});
test('API failures are JSON, and project files are not served', async () => {
  const response = await request(app).get('/api/nonexistent').expect(404);
  assert.match(response.headers['content-type'], /json/);
  for (const path of ['/.env', '/src/server.ts', '/prompts/00_master/system_prompt.md', '/supabase/migrations/0001_third_eye.sql']) await request(app).get(path).expect(404);
  const home = await request(app).get('/').expect(200); assert.ok(home.text.includes('THIRD EYE')); assert.ok(!home.text.includes('callGemini'));
});
test('oversized and malformed JSON are rejected', async () => {
  await request(app).post('/api/decisions').send({ decision: 'x'.repeat(66000) }).expect(413);
  await request(app).post('/api/decisions').set('Content-Type', 'application/json').send('{').expect(400);
});
