import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { z } from 'zod';
import type { Config } from './config.js';
import { missingConfig } from './config.js';
import { AppError } from './errors.js';
import { Repository } from './repository.js';
import { analysisService } from './analysis.js';
import { decisionSchema, updateSchema, runSchema, answerSchema, pageSchema } from './shared/schemas.js';

export function createApp(config: Config) {
  const app = express(); const analyze = analysisService(config);
  app.disable('x-powered-by');
  if (config.NODE_ENV === 'production') app.set('trust proxy', 1);
  const supabaseOrigin = config.SUPABASE_URL ? new URL(config.SUPABASE_URL).origin : null;
  app.use(helmet({ contentSecurityPolicy: { directives: {
    defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'], connectSrc: ["'self'", ...(supabaseOrigin ? [supabaseOrigin] : [])],
    imgSrc: ["'self'", 'data:'], objectSrc: ["'none'"], frameAncestors: ["'none'"],
    upgradeInsecureRequests: config.NODE_ENV === 'production' ? [] : null,
  } }, strictTransportSecurity: config.NODE_ENV === 'production' }));
  app.use((req, res, next) => {
    res.locals.requestId = randomUUID(); res.setHeader('X-Request-Id', res.locals.requestId);
    const start = Date.now();
    res.on('finish', () => console.info(JSON.stringify({ requestId: res.locals.requestId, method: req.method, route: req.route?.path || (req.path.startsWith('/api') ? '/api/unmatched' : '/static'), status: res.statusCode, durationMs: Date.now() - start })));
    next();
  });
  app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    const origin = req.get('origin');
    if (origin && origin !== new URL(config.APP_ORIGIN).origin) return next(new AppError(403, 'ORIGIN_DENIED', 'Request origin is not allowed.'));
    if (origin) { res.setHeader('Access-Control-Allow-Origin', origin); res.vary('Origin'); }
    if (req.method === 'OPTIONS') { res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,PUT,DELETE,OPTIONS'); res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type,Idempotency-Key'); res.sendStatus(204); return; }
    next();
  });
  app.use('/api', rateLimit({ windowMs: 60000, limit: 180, standardHeaders: 'draft-8', legacyHeaders: false, handler: (_req, _res, next) => next(new AppError(429, 'RATE_LIMITED', 'Too many requests. Please try again shortly.')) }));
  app.use(express.json({ limit: '64kb' }));
  app.get('/api/config', (_req, res) => res.json({ data: {
    supabaseUrl: config.SUPABASE_URL, supabasePublishableKey: config.SUPABASE_PUBLISHABLE_KEY,
    researchAvailable: !!config.TAVILY_API_KEY, fallbackAvailable: !!(config.GROQ_API_KEY && config.GROQ_MODEL),
    analysisAvailable: !missingConfig(config).length,
    setupRequired: missingConfig(config),
  } }));
  app.use('/api', (req, _res, next) => {
    const valid = /^\/decisions(?:\/[^/]+(?:\/(?:reflections(?:\/[^/]+)?|analyses(?:\/(?:by-key\/[^/]+|[^/]+))?))?)?\/?$/.test(req.path);
    if (!valid) return next(new AppError(404, 'NOT_FOUND', 'API route not found.'));
    next();
  });
  app.use('/api', async (req, res, next) => {
    try {
      const header = req.get('authorization');
      if (!header?.startsWith('Bearer ') || header.length > 8192) throw new AppError(401, 'UNAUTHENTICATED', 'Sign in to continue.');
      if (!config.SUPABASE_URL || !config.SUPABASE_PUBLISHABLE_KEY) throw new AppError(503, 'SETUP_REQUIRED', 'Supabase has not been configured.');
      const jwt = header.slice(7);
      const db = createClient(config.SUPABASE_URL, config.SUPABASE_PUBLISHABLE_KEY, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        global: { headers: { Authorization: `Bearer ${jwt}` }, fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(8000) }) },
      });
      const { data, error } = await db.auth.getUser(jwt);
      if (error || !data.user) throw new AppError(401, 'UNAUTHENTICATED', 'Your session expired. Sign in again.');
      res.locals.repo = new Repository(db, data.user.id); next();
    } catch (error) { next(error); }
  });
  const repo = (res: Response): Repository => res.locals.repo;
  const id = (req: Request, key = 'id') => z.uuid().parse(req.params[key]);
  app.post('/api/decisions', async (req, res) => res.status(201).json({ data: await repo(res).rpc('create_decision', { p_input: decisionSchema.parse(req.body) }) }));
  app.get('/api/decisions', async (req, res) => { const p = pageSchema.parse(req.query); res.json({ data: await repo(res).list('decisions', p.limit, p.cursor) }); });
  app.get('/api/decisions/:id', async (req, res) => res.json({ data: await repo(res).decision(id(req)) }));
  app.patch('/api/decisions/:id', async (req, res) => { const { expectedRevision, ...input } = updateSchema.parse(req.body); res.json({ data: await repo(res).rpc('update_decision', { p_id: id(req), p_revision: expectedRevision, p_input: input }) }); });
  app.delete('/api/decisions/:id', async (req, res) => { await repo(res).rpc('delete_decision', { p_id: id(req) }); res.json({ data: { deleted: true } }); });
  app.post('/api/decisions/:id/analyses', async (req, res) => {
    const body = runSchema.parse(req.body); const key = z.uuid().parse(req.get('Idempotency-Key'));
    const result = await analyze(repo(res), id(req), body.expectedRevision, key); res.status(result.status).json({ data: result.analysis });
  });
  app.get('/api/decisions/:id/analyses', async (req, res) => {
    const decisionId = id(req); await repo(res).decision(decisionId); await repo(res).rpc('expire_runs');
    const p = pageSchema.parse(req.query); res.json({ data: await repo(res).list('analyses', p.limit, p.cursor, decisionId) });
  });
  app.get('/api/decisions/:id/analyses/by-key/:key', async (req, res) => res.json({ data: await repo(res).analysis(id(req), id(req, 'key'), true) }));
  app.get('/api/decisions/:id/analyses/:analysisId', async (req, res) => res.json({ data: await repo(res).analysis(id(req), id(req, 'analysisId')) }));
  app.get('/api/decisions/:id/reflections', async (req, res) => res.json({ data: await repo(res).reflections(id(req)) }));
  app.put('/api/decisions/:id/reflections/:questionId', async (req, res) => {
    const body = answerSchema.parse(req.body); const question = z.string().regex(/^q\d{1,2}$/).parse(req.params.questionId);
    res.json({ data: await repo(res).rpc('save_reflection', { p_id: id(req), p_analysis: body.analysisId, p_question: question, p_answer: body.answer, p_revision: body.expectedRevision }) });
  });
  app.use('/api', (_req, _res, next) => next(new AppError(404, 'NOT_FOUND', 'API route not found.')));
  app.use('/assets', express.static(resolve('public/assets'), { fallthrough: false, maxAge: '1h' }));
  app.get('/', (_req, res) => res.sendFile(resolve('index.html')));
  app.use((_req, _res, next) => next(new AppError(404, 'NOT_FOUND', 'Page not found.')));
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const e = error instanceof z.ZodError ? new AppError(400, 'VALIDATION_ERROR', error.issues.map(i => `${i.path.join('.') || 'Input'}: ${i.message}`).join('; '))
      : error instanceof AppError ? error
      : (error as { type?: string })?.type === 'entity.too.large' ? new AppError(413, 'BODY_TOO_LARGE', 'Request exceeds 64 KB.')
      : error instanceof SyntaxError ? new AppError(400, 'INVALID_JSON', 'Request contains invalid JSON.')
      : (error as { status?: number })?.status === 404 ? new AppError(404, 'NOT_FOUND', 'File not found.')
      : new AppError(500, 'INTERNAL_ERROR', 'Request failed. Please try again.');
    if (e.status === 429) res.setHeader('Retry-After', e.code === 'RATE_LIMITED' ? '3600' : '10');
    console.error(JSON.stringify({ requestId: res.locals.requestId, code: e.code }));
    res.status(e.status).json({ error: { code: e.code, message: e.message, requestId: res.locals.requestId, ...(e.analysisId ? { analysisId: e.analysisId } : {}) } });
  });
  return app;
}
