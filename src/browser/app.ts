import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js';
import { decisionSchema, analysisSchema, fieldLimits, type Decision, type DecisionInput, type Analysis, type Reflection } from '../shared/schemas.js';
import { renderSummary, renderAssumptions, renderBlindspots, renderConflicts, renderPerspectives, renderReflection } from './render.js';

const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const input = (id: string) => el<HTMLInputElement>(id);
let auth: SupabaseClient | undefined;
let session: Session | null = null;
let current: Decision | null = null;
let selected: Analysis | null = null;
let dirty = false;
let busy = false;
let historyCursor: string | null = null;
let analysisCursor: string | null = null;
let config: { analysisAvailable: boolean; researchAvailable: boolean; fallbackAvailable: boolean; setupRequired: string[] };
let recovering = false;
const dates = (value: string) => new Date(value).toLocaleString();
el('dateStamp').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();
for (const [field, max] of Object.entries(fieldLimits)) {
  const node = input(`f-${field}`); node.maxLength = max;
  const label = node.parentElement!.querySelector('label')!; label.htmlFor = node.id;
  const error = document.createElement('span'); error.id = `${node.id}-error`; error.className = 'field-error'; node.setAttribute('aria-describedby', error.id); node.after(error);
}
input('f-decision').required = true;
function showError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '');
  el('errorMsg').textContent = message; el('errorMsg').classList.toggle('hidden', !message);
  if (message) el('errorMsg').focus();
}
function notice(message: string) { el('notice').textContent = message; }
function setBusy(value: boolean, label = 'Working…') {
  busy = value;
  document.querySelectorAll<HTMLButtonElement>('button').forEach(b => b.disabled = value);
  document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('#decisionForm input,#decisionForm textarea,#answers textarea').forEach(n => n.disabled = value);
  input('researchEnabled').disabled = value || !config?.researchAvailable;
  el('loadingIndicator').classList.toggle('hidden', !value); el('loadingLabel').textContent = label;
  el('decisionForm').setAttribute('aria-busy', String(value));
}
async function action(fn: () => Promise<void>, label?: string) {
  if (busy) return;
  showError(''); setBusy(true, label);
  try { await fn(); } catch (error) { showError(error); } finally { setBusy(false); }
}
class ApiError extends Error { constructor(message: string, readonly status: number, readonly code: string, readonly analysisId?: string) { super(message); } }
async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!auth) throw new Error('Supabase is not configured. See the service notice above.');
  const { data } = await auth!.auth.getSession(); session = data.session;
  if (!session) throw new Error('Sign in to save and examine your decision.');
  let response: Response;
  try { response = await fetch(`/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}`, ...options.headers }, signal: AbortSignal.timeout(130000) }); }
  catch { throw new Error('Connection interrupted. Your input is preserved. Refresh the archive to check saved runs before retrying.'); }
  const value = await response.json();
  if (!response.ok) {
    if (response.status === 401) notice('Your session expired. Please sign in again.');
    throw new ApiError(`${value.error?.message || 'Request failed.'}${value.error?.requestId ? ` (Reference: ${value.error.requestId})` : ''}`, response.status, value.error?.code, value.error?.analysisId);
  }
  return value.data;
}
function fields(): DecisionInput {
  for (const key of Object.keys(fieldLimits)) { el(`f-${key}-error`).textContent = ''; input(`f-${key}`).removeAttribute('aria-invalid'); }
  const values = Object.fromEntries(Object.keys(fieldLimits).map(key => [key, input(`f-${key}`).value]));
  const parsed = decisionSchema.safeParse({ ...values, researchEnabled: input('researchEnabled').checked });
  if (!parsed.success) {
    for (const issue of parsed.error.issues) { const key = String(issue.path[0]); if (document.getElementById(`f-${key}`)) { el(`f-${key}-error`).textContent = issue.message; input(`f-${key}`).setAttribute('aria-invalid', 'true'); } }
    throw new Error('Describe your decision and add context or reasons. Check the highlighted fields.');
  }
  return parsed.data;
}
function updateSaveStatus() {
  el('saveStatus').textContent = current ? `${dirty ? 'Unsaved changes · ' : 'Saved · '}Revision ${current.revision} · ${dates(current.updated_at)}` : 'Your decision has not been saved.';
  el('deleteDecision').hidden = !current;
  if (selected) updateAnalysisMeta();
}
async function save(): Promise<Decision> {
  const body = fields();
  if (current && !dirty) return current;
  const saved = await api<Decision>(current ? `/decisions/${current.id}` : '/decisions', { method: current ? 'PATCH' : 'POST', body: JSON.stringify(current ? { ...body, expectedRevision: current.revision } : body) });
  current = saved; dirty = false; updateSaveStatus(); await loadHistory(); return saved;
}
function clearDecision() {
  current = null; selected = null; dirty = false;
  el<HTMLFormElement>('decisionForm').reset(); el('analysis-output').classList.remove('visible'); el('analysisHistory').replaceChildren(); el('moreAnalyses').hidden = true;
  updateSaveStatus(); input('f-decision').focus();
}
type Page<T> = { items: T[]; nextCursor: string | null };
function row(text: string, label: string, onClick: () => Promise<void>) {
  const node = document.createElement('div'); node.className = 'history-row';
  const button = document.createElement('button'); button.type = 'button'; button.textContent = text; button.addEventListener('click', () => action(onClick));
  const meta = document.createElement('span'); meta.className = 'meta'; meta.textContent = label; node.append(button, meta); return node;
}
async function loadHistory(append = false) {
  const page = await api<Page<Pick<Decision, 'id' | 'decision' | 'created_at'>>>('/decisions?limit=10' + (append && historyCursor ? `&cursor=${encodeURIComponent(historyCursor)}` : ''));
  if (!append) el('historyList').replaceChildren();
  for (const d of page.items) el('historyList').append(row(d.decision, dates(d.created_at), () => openDecision(d.id)));
  if (!el('historyList').childElementCount) el('historyList').innerHTML = '<p class="empty-state">No saved decisions yet. Describe one below to begin.</p>';
  historyCursor = page.nextCursor; el('moreHistory').hidden = !historyCursor;
}
async function loadAnalyses(append = false) {
  if (!current) return;
  const page = await api<Page<Analysis>>(`/decisions/${current.id}/analyses?limit=10${append && analysisCursor ? `&cursor=${encodeURIComponent(analysisCursor)}` : ''}`);
  if (!append) el('analysisHistory').replaceChildren();
  for (const a of page.items) el('analysisHistory').append(row(`Revision ${a.input_revision} · ${a.status}`, dates(a.created_at), async () => showAnalysis(await api<Analysis>(`/decisions/${current!.id}/analyses/${a.id}`))));
  if (!el('analysisHistory').childElementCount) el('analysisHistory').innerHTML = '<p class="meta">No analyses saved for this decision.</p>';
  analysisCursor = page.nextCursor; el('moreAnalyses').hidden = !analysisCursor;
}
async function openDecision(id: string) {
  if (dirty && !confirm('Discard unsaved changes and open this decision?')) return;
  const saved = await api<Decision>(`/decisions/${id}`);
  current = saved; selected = null; dirty = false;
  for (const key of Object.keys(fieldLimits)) input(`f-${key}`).value = saved[key as keyof typeof fieldLimits];
  input('researchEnabled').checked = saved.researchEnabled;
  el('analysis-output').classList.remove('visible'); updateSaveStatus(); await loadAnalyses();
  const pending = sessionStorage.getItem(`third-eye-pending:${session!.user.id}:${id}`);
  if (pending) {
    try { const run = await api<Analysis>(`/decisions/${id}/analyses/by-key/${pending}`); await showAnalysis(await poll(run)); sessionStorage.removeItem(`third-eye-pending:${session!.user.id}:${id}`); }
    catch (error) { if (!(error instanceof ApiError && error.status === 404)) throw error; }
  }
}
function updateAnalysisMeta() {
  if (!selected) return;
  const stale = dirty || current?.revision !== selected.input_revision;
  el('analysisMeta').textContent = `Analysis of revision ${selected.input_revision} · ${selected.provider || ''} / ${selected.model || ''} · ${selected.completed_at ? dates(selected.completed_at) : selected.status} · Research: ${selected.research_status.replaceAll('_', ' ')}${stale ? ' · Earlier input — examine again to include your latest changes.' : ''}. Importance labels indicate attention, not option scores.`;
}
async function showAnalysis(analysis: Analysis) {
  selected = analysis;
  if (analysis.status === 'processing') { notice('This analysis is still processing. Checking its saved status…'); return showAnalysis(await poll(analysis)); }
  if (analysis.status === 'failed') { el('analysis-output').classList.remove('visible'); throw new Error(`This run failed (${analysis.error_code || 'ANALYSIS_FAILED'}). Your saved input is available for a new attempt.`); }
  const output = analysisSchema.parse(analysis.output);
  renderSummary(output.summary); renderAssumptions(output.assumptions); renderBlindspots(output.blindspots); renderConflicts(output.conflicts); renderPerspectives(output.perspectives); renderReflection(output.reflection);
  for (const [id, length] of [['assumptionList', output.assumptions.length], ['blindspotGrid', output.blindspots.length], ['conflictList', output.conflicts.length], ['perspectiveGrid', output.perspectives.length]] as const)
    if (!length) el(id).innerHTML = '<p class="empty-state">No findings in this section for the supplied information.</p>';
  updateAnalysisMeta();
  el('limitations').textContent = output.limitations.join(' ') + (['partial','unavailable','failed'].includes(analysis.research_status) ? ' Public research was incomplete or unavailable; this analysis may rely only on your supplied information.' : '');
  el('sources').replaceChildren();
  for (const source of analysis.sources || []) {
    const url = new URL(source.url); if (!['http:','https:'].includes(url.protocol)) continue;
    const node = document.createElement('p'); node.id = `source-${source.id}`; node.className = 'meta';
    const a = document.createElement('a'); a.href = url.href; a.textContent = source.title; a.target = '_blank'; a.rel = 'noopener noreferrer';
    node.append(a, document.createTextNode(` · Retrieved ${dates(source.retrieved_at)} · ${source.excerpt}`)); el('sources').append(node);
  }
  if (!el('sources').childElementCount) el('sources').textContent = 'No external sources were used in this analysis.';
  await renderAnswers(); el('analysis-output').classList.add('visible'); el('analysis-output').focus(); notice('Saved analysis loaded.');
}
async function renderAnswers() {
  const answers = await api<Reflection[]>(`/decisions/${current!.id}/reflections`);
  el('answers').replaceChildren();
  for (const q of selected!.questions) {
    const wrap = document.createElement('div'); wrap.className = 'answer-field';
    const label = document.createElement('label'); label.htmlFor = `answer-${q.id}`; label.textContent = q.text;
    const area = document.createElement('textarea'); area.id = label.htmlFor; area.className = 'field-textarea'; area.maxLength = 2000;
    const existing = answers.find(a => a.analysis_id === selected!.id && a.question_id === q.id); area.value = existing?.answer || '';
    const button = document.createElement('button'); button.type = 'button'; button.textContent = existing ? 'Update answer' : 'Save answer';
    const state = document.createElement('span'); state.className = 'meta'; state.textContent = existing ? ' Saved' : '';
    button.addEventListener('click', () => action(async () => {
      if (!area.value.trim()) throw new Error('Write an answer before saving.');
      if (dirty) await save();
      const result = await api<{ decisionRevision: number; reflection: Reflection }>(`/decisions/${current!.id}/reflections/${q.id}`, { method: 'PUT', body: JSON.stringify({ analysisId: selected!.id, answer: area.value.trim(), expectedRevision: current!.revision }) });
      current = await api<Decision>(`/decisions/${current!.id}`); updateSaveStatus(); button.textContent = 'Update answer'; state.textContent = ' Saved'; notice(`Answer saved in revision ${result.decisionRevision}. Examine again to include it.`);
    }));
    wrap.append(label, area, button, state); el('answers').append(wrap);
  }
  if (!selected!.questions.length) el('answers').textContent = 'No follow-up questions were generated for this analysis.';
}
async function poll(run: Analysis): Promise<Analysis> {
  const end = Math.max(Date.now() + 3000, new Date(run.expires_at).getTime() + 3000);
  while (run.status === 'processing' && Date.now() < end) {
    await new Promise(resolve => setTimeout(resolve, 1800));
    run = await api<Analysis>(`/decisions/${run.decision_id}/analyses/${run.id}`);
  }
  if (run.status === 'processing') throw new Error('The request is still being reconciled. Reopen this decision from the archive to check its saved status.');
  return run;
}
async function runAnalysis() {
  if (!config.analysisAvailable) throw new Error('Analysis setup is incomplete. See the service notice above. You can still save your decision.');
  const saved = await save();
  const storageKey = `third-eye-pending:${session!.user.id}:${saved.id}`;
  let key = sessionStorage.getItem(storageKey);
  if (key) {
    try { const prior = await api<Analysis>(`/decisions/${saved.id}/analyses/by-key/${key}`); await showAnalysis(await poll(prior)); sessionStorage.removeItem(storageKey); await loadAnalyses(); return; }
    catch (error) { if (error instanceof ApiError && error.status === 404) { /* retry same request key */ } else { if (error instanceof ApiError) sessionStorage.removeItem(storageKey); throw error; } }
  } else { key = crypto.randomUUID(); sessionStorage.setItem(storageKey, key); }
  let run: Analysis;
  try { run = await api<Analysis>(`/decisions/${saved.id}/analyses`, { method: 'POST', headers: { 'Idempotency-Key': key }, body: JSON.stringify({ expectedRevision: saved.revision }) }); }
  catch (error) {
    if (error instanceof ApiError) {
      if (error.code === 'ACTIVE_RUN' && error.analysisId) { run = await api<Analysis>(`/decisions/${saved.id}/analyses/${error.analysisId}`); }
      else { sessionStorage.removeItem(storageKey); await loadAnalyses(); throw error; }
    } else throw error;
  }
  run = await poll(run); sessionStorage.removeItem(storageKey); await loadAnalyses(); await showAnalysis(run);
}
function updateAccount() {
  const signedIn = !!session;
  el('accountStatus').textContent = signedIn ? `Signed in as ${session!.user.email || 'your account'}` : 'Sign in to save your decisions';
  for (const id of ['email','password','signIn','signUp','recover']) { el(id).hidden = signedIn && !recovering; const label = document.querySelector<HTMLLabelElement>(`label[for="${id}"]`); if (label) label.hidden = signedIn && !recovering; }
  input('email').required = !signedIn; input('password').required = !signedIn || recovering;
  el('signOut').hidden = !signedIn; el('history').hidden = !signedIn;
  if (recovering) { el('signIn').textContent = 'Set new password'; el('signUp').hidden = true; el('recover').hidden = true; input('email').hidden = true; document.querySelector<HTMLLabelElement>('label[for="email"]')!.hidden = true; input('password').autocomplete = 'new-password'; }
  else el('signIn').textContent = 'Sign in';
}
el('decisionForm').addEventListener('input', () => { dirty = true; updateSaveStatus(); });
el('decisionForm').addEventListener('submit', e => { e.preventDefault(); void action(runAnalysis, 'Examining your saved reasoning…'); });
el('saveDecision').addEventListener('click', () => action(async () => { await save(); notice('Decision saved.'); }));
el('newDecision').addEventListener('click', () => { if (!dirty || confirm('Discard unsaved changes and start a new decision?')) clearDecision(); });
el('refreshHistory').addEventListener('click', () => action(async () => { await loadHistory(); if (current) await loadAnalyses(); }));
el('moreHistory').addEventListener('click', () => action(() => loadHistory(true)));
el('moreAnalyses').addEventListener('click', () => action(() => loadAnalyses(true)));
el('deleteDecision').addEventListener('click', () => action(async () => {
  if (!current || !confirm('Delete this decision and all its analyses and answers? This cannot be undone.')) return;
  await api(`/decisions/${current.id}`, { method: 'DELETE' }); clearDecision(); await loadHistory(); notice('Decision and its saved analyses and answers deleted.');
}));
el('accountForm').addEventListener('submit', e => { e.preventDefault(); void action(async () => {
  if (!auth) throw new Error('Supabase is not configured.');
  if (recovering) { const { error } = await auth.auth.updateUser({ password: input('password').value }); if (error) throw error; recovering = false; updateAccount(); notice('Password updated.'); }
  else { const { error } = await auth.auth.signInWithPassword({ email: input('email').value.trim(), password: input('password').value }); if (error) throw error; }
  input('password').value = '';
}); });
el('signUp').addEventListener('click', () => action(async () => {
  if (!el<HTMLFormElement>('accountForm').reportValidity()) return;
  if (!auth) throw new Error('Supabase is not configured.');
  const { data, error } = await auth.auth.signUp({ email: input('email').value.trim(), password: input('password').value, options: { emailRedirectTo: location.origin } });
  if (error) throw error; input('password').value = ''; notice(data.session ? 'Account created and signed in.' : 'Check your email to confirm your account, then sign in.');
}));
el('recover').addEventListener('click', () => action(async () => {
  if (!input('email').reportValidity()) return;
  if (!auth) throw new Error('Supabase is not configured.');
  const { error } = await auth.auth.resetPasswordForEmail(input('email').value.trim(), { redirectTo: location.origin }); if (error) throw error; notice('If this account exists, a password recovery email has been requested.');
}));
el('signOut').addEventListener('click', () => action(async () => {
  if (dirty && !confirm('Sign out and discard unsaved changes?')) return;
  const { error } = await auth!.auth.signOut(); if (error) throw error; clearDecision(); notice('Signed out.');
}));
window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

async function initialize() {
  const response = await fetch('/api/config'); if (!response.ok) throw new Error('Unable to load application configuration.');
  const { data } = await response.json(); config = data;
  el('serviceStatus').textContent = config.setupRequired.length ? `Setup required: ${config.setupRequired.join(', ')}. Account and save features work once Supabase tables are installed.` : 'Live analysis is configured. Saved decisions remain private to your account.';
  el('researchStatus').textContent = config.researchAvailable ? 'Optional: sends only generalized public topics to search. Your decision and saved answers are sent to the AI provider for analysis.' : 'Public research is unavailable. Analysis uses the information you provide.';
  input('researchEnabled').disabled = !config.researchAvailable;
  if (!data.supabaseUrl || !data.supabasePublishableKey) { updateAccount(); return; }
  auth = createClient(data.supabaseUrl, data.supabasePublishableKey);
  auth.auth.onAuthStateChange((event, next) => {
    const changed = session?.user.id !== next?.user.id;
    session = next; if (event === 'PASSWORD_RECOVERY') recovering = true;
    updateAccount();
    if (changed && !next) { clearDecision(); el('historyList').replaceChildren(); }
    if (next && (changed || event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) setTimeout(() => { void loadHistory().catch(showError); }, 0);
  });
  const { data: restored, error } = await auth.auth.getSession(); if (error) throw error; session = restored.session; updateAccount();
  if (session) await loadHistory();
}
void initialize().catch(showError);
