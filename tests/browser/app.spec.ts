import { test, expect } from '@playwright/test';

test('real served page has accessible form, no client provider secrets, and fits viewport', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'THIRD EYE', exact: true })).toBeVisible();
  await expect(page.locator('#dateStamp')).not.toBeEmpty();
  await expect(page.getByLabel('Decision or Question')).toBeVisible();
  await expect(page.locator('#apiKey')).toHaveCount(0);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  expect(overflow).toBe(false);
  await page.getByLabel('Decision or Question').fill('Should I take an evening class?');
  await page.getByRole('button', { name: 'SAVE DECISION', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('context or reasons');
  expect(errors).toEqual([]);
});

test('mock API UI workflow: login, save, grounded results, answer, history, refresh, delete', async ({ page }) => {
  // Fixtures exist only in tests; this is explicitly not live Supabase/AI verification.
  const user = { id: '8bd8c3d7-2655-4bfa-a3b6-e4f299c59266', email: 'test@example.org', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
  let decision: any = null; let run: any = null; const answers: any[] = [];
  const now = () => new Date().toISOString();
  await page.route('**/api/config', route => route.fulfill({ json: { data: { supabaseUrl: 'http://localhost:3100', supabasePublishableKey: 'test-publishable', analysisAvailable: true, researchAvailable: false, fallbackAvailable: false, setupRequired: [] } } }));
  await page.route('**/auth/v1/**', route => route.fulfill({ json: route.request().url().includes('/token') ? { access_token: 'test-access-token', refresh_token: 'test-refresh-token', expires_in: 3600, token_type: 'bearer', user } : user }));
  await page.route('**/api/decisions**', async route => {
    const req = route.request(), path = new URL(req.url()).pathname, method = req.method(); let result: any;
    if (method === 'POST' && path === '/api/decisions') { decision = { ...req.postDataJSON(), id: '5cec15e5-1c05-44e9-a9f1-cfb8701f9023', user_id: user.id, revision: 1, created_at: now(), updated_at: now() }; result = decision; }
    else if (method === 'POST' && path.endsWith('/analyses')) {
      run = { id: 'd32b1547-092e-4999-bde4-24c090e0e056', decision_id: decision.id, input_revision: decision.revision, status: 'completed', created_at: now(), completed_at: now(), provider: 'test-provider', model: 'fixture', research_status: 'not_requested', sources: [], questions: [{ id: 'q1', path: 'assumptions.0.question', text: 'Which class hours are available?' }], output: { summary: { decision: decision.decision, options: '', statedGoals: '', keyReasons: decision.reasons, explicitConstraints: '', affected: '' }, assumptions: [{ category: 'Needs Evidence', text: '<script>unsafe()</script>', explanation: 'Check the timetable.', question: 'Which class hours are available?', warn: false, grounding: { kind: 'inference', inputQuotes: [{ field: 'context', quote: decision.context }], sourceIds: [] } }], blindspots: [], conflicts: [], perspectives: [], reflection: { topBlindspots: [], strongestAssumptions: [], unansweredQuestions: [], infoToGather: [], assumptionMatrix: [], checklist: ['Review timetable'] }, limitations: [] } }; result = run;
    } else if (method === 'PUT') { const body = req.postDataJSON(); decision.revision++; answers.push({ analysis_id: run.id, question_id: 'q1', answer: body.answer }); result = { decisionRevision: decision.revision, reflection: answers.at(-1) }; }
    else if (method === 'DELETE') { decision = null; run = null; result = { deleted: true }; }
    else if (path.endsWith('/reflections')) result = answers;
    else if (path.endsWith('/analyses')) result = { items: run ? [run] : [], nextCursor: null };
    else if (path.includes('/analyses/')) result = run;
    else if (path === '/api/decisions') result = { items: decision ? [decision] : [], nextCursor: null };
    else result = decision;
    await route.fulfill({ json: { data: result } });
  });
  await page.goto('/'); await page.getByLabel('Email', { exact: true }).fill(user.email); await page.getByLabel('Password', { exact: true }).fill('test-password-only');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.locator('#accountStatus')).toContainText('Signed in as');
  await page.getByLabel('Decision or Question').fill('Should I take an evening class?'); await page.getByLabel('Context & Background').fill('I work during the day.');
  await page.getByRole('button', { name: 'EXAMINE DECISION' }).click();
  await expect(page.locator('#analysis-output')).toBeVisible();
  await expect(page.locator('#assumptionList')).toContainText('<script>unsafe()</script>');
  await expect(page.locator('#assumptionList script')).toHaveCount(0);
  await page.getByLabel('Review timetable').check();
  await page.getByLabel('Which class hours are available?', { exact: true }).fill('Evenings work for me.');
  await page.getByRole('button', { name: 'Save answer', exact: true }).click();
  await expect(page.locator('#analysisMeta')).toContainText('Earlier input');
  await page.reload(); await expect(page.locator('#historyList')).toContainText('Should I take an evening class?');
  await page.locator('#historyList button').first().click(); await page.locator('#analysisHistory button').first().click();
  await expect(page.getByLabel('Which class hours are available?', { exact: true })).toHaveValue('Evenings work for me.');
  page.once('dialog', d => d.accept()); await page.getByRole('button', { name: 'Delete decision', exact: true }).click();
  await expect(page.locator('#historyList')).toContainText('No saved decisions');
});
