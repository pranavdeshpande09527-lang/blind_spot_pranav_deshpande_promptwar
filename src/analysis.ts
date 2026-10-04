import type { Config } from './config.js';
import { missingConfig } from './config.js';
import { AppError } from './errors.js';
import { research, synthesize } from './providers.js';
import { questionsFor, type Analysis } from './shared/schemas.js';
import type { Repository } from './repository.js';

export function analysisService(config: Config) {
  let active = 0;
  const users = new Set<string>();
  return async (repo: Repository, decisionId: string, revision: number, key: string) => {
    if (missingConfig(config).length) throw new AppError(503, 'SETUP_REQUIRED', 'Complete server and database configuration before running analysis.');
    // Resolve durable replay before taking process-local capacity.
    try {
      const replay = await repo.analysis(decisionId, key, true);
      if (replay.input_revision !== revision) throw new AppError(409, 'IDEMPOTENCY_CONFLICT', 'This request key belongs to another input revision.');
      return { analysis: replay, status: replay.status === 'processing' ? 202 : 200 };
    } catch (error) { if (!(error instanceof AppError) || error.status !== 404) throw error; }
    if (active >= config.MAX_CONCURRENT_ANALYSES || users.has(repo.userId)) throw new AppError(429, 'BUSY', 'An analysis is already in progress. Please try again shortly.');
    active++; users.add(repo.userId);
    let run: Analysis | undefined; let researchStatus = 'not_requested';
    try {
      const result = await repo.rpc<{ analysis: Analysis; replay: boolean; active?: boolean }>('begin_analysis', { p_id: decisionId, p_revision: revision, p_key: key, p_secret: config.ANALYSIS_SIGNING_SECRET, p_timeout_ms: config.ANALYSIS_TIMEOUT_MS, p_hourly_limit: config.MAX_ANALYSES_PER_USER_PER_HOUR });
      if (result.active) throw new AppError(409, 'ACTIVE_RUN', 'An analysis is already running for this decision.', result.analysis.id);
      if (result.replay) return { analysis: await repo.analysis(decisionId, result.analysis.id), status: result.analysis.status === 'processing' ? 202 : 200 };
      run = result.analysis;
      const deadline = new Date(run.expires_at).getTime() - 750;
      const evidence = await research(config, run.input_snapshot, deadline); researchStatus = evidence.status;
      const generated = await synthesize(config, run.input_snapshot, evidence.sources, researchStatus, deadline);
      const saved = await repo.rpc<Analysis>('finish_analysis', { p_id: run.id, p_secret: config.ANALYSIS_SIGNING_SECRET, p_output: generated.output, p_questions: questionsFor(generated.output), p_sources: evidence.sources, p_provider: generated.provider, p_model: generated.model, p_research: researchStatus });
      if (saved.status !== 'completed') throw new AppError(504, 'DEADLINE_EXCEEDED', 'Analysis deadline exceeded.', saved.id);
      console.info(JSON.stringify({ event: 'analysis_completed', analysisId: run.id, provider: generated.provider, model: generated.model, research: researchStatus, durationMs: Date.now() - new Date(run.started_at).getTime() }));
      return { analysis: { ...saved, sources: evidence.sources }, status: 201 };
    } catch (error) {
      const safe = error instanceof AppError ? error : new AppError(502, 'ANALYSIS_FAILED', 'Analysis failed. Your decision is saved.');
      if (run) {
        safe.analysisId = run.id;
        try { await repo.rpc('finish_analysis', { p_id: run.id, p_secret: config.ANALYSIS_SIGNING_SECRET, p_output: null, p_questions: [], p_sources: [], p_provider: null, p_model: null, p_research: researchStatus, p_error: safe.code }); }
        catch { console.error(JSON.stringify({ event: 'analysis_finalize_failed', analysisId: run.id, code: safe.code })); }
      }
      throw safe;
    } finally { active--; users.delete(repo.userId); }
  };
}
