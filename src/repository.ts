import type { SupabaseClient } from '@supabase/supabase-js';
import { cursorSchema, type Analysis, type Decision } from './shared/schemas.js';
import { AppError, dbError } from './errors.js';
export class Repository {
  constructor(readonly db: SupabaseClient, readonly userId: string) {}
  async rpc<T>(name: string, args: Record<string, unknown> = {}): Promise<T> {
    const { data, error } = await this.db.rpc(name, args); if (error) dbError(error); return data as T;
  }
  async decision(id: string): Promise<Decision> {
    const { data, error } = await this.db.from('decisions').select('*').eq('id', id).eq('user_id', this.userId).maybeSingle();
    if (error) dbError(error); if (!data) throw new AppError(404, 'NOT_FOUND', 'Decision not found.'); return data as Decision;
  }
  async list(table: 'decisions' | 'analyses', limit: number, cursor?: string, decisionId?: string) {
    const columns = table === 'decisions' ? 'id,decision,revision,created_at,updated_at' : 'id,decision_id,input_revision,status,created_at,completed_at,expires_at,provider,model,research_status,error_code';
    let query = this.db.from(table).select(columns).eq('user_id', this.userId).order('created_at', { ascending: false }).order('id', { ascending: false }).limit(limit + 1);
    if (decisionId) query = query.eq('decision_id', decisionId);
    if (cursor) {
      let parsed;
      try { parsed = cursorSchema.parse(JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'))); }
      catch { throw new AppError(400, 'INVALID_CURSOR', 'Invalid history cursor.'); }
      query = query.or(`created_at.lt.${parsed.created_at},and(created_at.eq.${parsed.created_at},id.lt.${parsed.id})`);
    }
    const { data, error } = await query; if (error) dbError(error);
    const rows = (data || []) as unknown as { id: string; created_at: string }[];
    const items = rows.slice(0, limit); const last = items.at(-1);
    return { items, nextCursor: rows.length > limit && last ? Buffer.from(JSON.stringify({ id: last.id, created_at: last.created_at })).toString('base64url') : null };
  }
  async analysis(decisionId: string, id: string, byKey = false): Promise<Analysis> {
    await this.rpc('expire_runs');
    const { data, error } = await this.db.from('analyses').select('*,sources(id,title,url,excerpt,retrieved_at)').eq('decision_id', decisionId).eq('user_id', this.userId).eq(byKey ? 'idempotency_key' : 'id', id).maybeSingle();
    if (error) dbError(error); if (!data) throw new AppError(404, 'NOT_FOUND', 'Analysis not found.'); return data as Analysis;
  }
  async reflections(decisionId: string) {
    await this.decision(decisionId);
    const { data, error } = await this.db.from('reflections').select('*').eq('decision_id', decisionId).eq('user_id', this.userId).order('updated_at', { ascending: false }).limit(200);
    if (error) dbError(error); return data;
  }
}
