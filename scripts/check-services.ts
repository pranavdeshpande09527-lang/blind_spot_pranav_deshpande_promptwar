import { readConfig } from '../src/config.js';
import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import { analysisSchema } from '../src/shared/schemas.js';
const config = readConfig();
for (const provider of ['gemini','groq'] as const) {
  const model = provider === 'gemini' ? config.GEMINI_MODEL : config.GROQ_MODEL;
  const key = provider === 'gemini' ? config.GEMINI_API_KEY : config.GROQ_API_KEY;
  if (!key || !model) { console.log(JSON.stringify({ provider, configured: false })); continue; }
  try {
    const response = await fetch(provider === 'gemini' ? `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}` : 'https://api.groq.com/openai/v1/models', {
      headers: provider === 'gemini' ? { 'x-goog-api-key': key } : { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10000),
    });
    const data = await response.json();
    let message = String(data.error?.message || '');
    for (const secret of [config.GEMINI_API_KEY,config.GROQ_API_KEY,config.TAVILY_API_KEY,config.ANALYSIS_SIGNING_SECRET].filter(Boolean)) message = message.replaceAll(secret,'[redacted]');
    console.log(JSON.stringify({ provider, model, status: response.status, available: response.ok && (provider === 'gemini' || data.data?.some((m: { id: string }) => m.id === model)), message: message.slice(0,800) }));
  } catch { console.log(JSON.stringify({ provider, error: 'Connection failed' })); }
}
if (process.argv.includes('--generation')) {
  const examples = JSON.parse(await readFile('tests/evaluation-cases.json','utf8'));
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.GEMINI_MODEL)}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': config.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ parts: [{ text: JSON.stringify(examples[0]) }] }], generationConfig: { responseMimeType: 'application/json', responseJsonSchema: z.toJSONSchema(analysisSchema), maxOutputTokens: 256 } }), signal: AbortSignal.timeout(18000),
    });
    const data = await response.json();
    let message = String(data.error?.message || '');
    for (const value of [config.GEMINI_API_KEY, config.GROQ_API_KEY, config.TAVILY_API_KEY].filter(Boolean)) message = message.replaceAll(value,'[redacted]');
    console.log(JSON.stringify({ check: 'generation_schema', status: response.status, message: message.slice(0,1800) }));
  } catch { console.log('Generation diagnostic timed out or failed.'); }
}
try {
  const response = await fetch(`${config.SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: config.SUPABASE_PUBLISHABLE_KEY }, signal: AbortSignal.timeout(10000) });
  const data = await response.json();
  console.log(JSON.stringify({ provider: 'supabase_auth', status: response.status, emailEnabled: data.external?.email, signupDisabled: data.disable_signup, autoConfirm: data.mailer_autoconfirm }));
} catch { console.log('Supabase auth configuration check failed.'); }
