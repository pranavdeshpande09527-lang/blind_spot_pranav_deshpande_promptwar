import { z } from 'zod';

export const fieldLimits = { decision: 2000, context: 12000, options: 4000, reasons: 12000, constraints: 4000, affected: 4000, deadline: 500 } as const;
export const decisionFields = {
  decision: z.string().trim().min(1).max(2000),
  context: z.string().trim().max(12000).default(''),
  options: z.string().trim().max(4000).default(''),
  reasons: z.string().trim().max(12000).default(''),
  constraints: z.string().trim().max(4000).default(''),
  affected: z.string().trim().max(4000).default(''),
  deadline: z.string().trim().max(500).default(''),
  researchEnabled: z.boolean().default(false),
};
const hasContext = (v: { context: string; reasons: string }) => !!(v.context || v.reasons);
export const decisionSchema = z.strictObject(decisionFields).refine(hasContext, { message: 'Add context or reasons.', path: ['context'] });
export const updateSchema = z.strictObject({ ...decisionFields, expectedRevision: z.number().int().positive() }).refine(hasContext, { message: 'Add context or reasons.', path: ['context'] });
export const runSchema = z.strictObject({ expectedRevision: z.number().int().positive() });
export const answerSchema = z.strictObject({ analysisId: z.uuid(), answer: z.string().trim().min(1).max(2000), expectedRevision: z.number().int().positive() });
export const pageSchema = z.strictObject({ limit: z.coerce.number().int().min(1).max(50).default(20), cursor: z.string().max(500).optional() });
export const cursorSchema = z.strictObject({ created_at: z.iso.datetime({ offset: true }), id: z.uuid() });
const text = z.string().max(2000);
const list = z.array(text).max(8);
export const groundingSchema = z.strictObject({
  kind: z.enum(['user_statement', 'inference', 'missing_information']),
  inputQuotes: z.array(z.strictObject({ field: z.string().max(100), quote: text.min(1) })).max(8),
  sourceIds: z.array(z.uuid()).max(6),
});
export const sections = ['WHAT MAY BE MISSING', 'WHO ELSE IS AFFECTED', 'LONG-TERM IMPACT', 'PRACTICAL RISKS', 'EMOTIONAL FACTORS', 'ALTERNATIVE PERSPECTIVES', 'TRADE-OFFS NOT YET CONSIDERED'] as const;
export const analysisSchema = z.strictObject({
  summary: z.strictObject({ decision: text, options: text, statedGoals: text, keyReasons: text, explicitConstraints: text, affected: text }),
  assumptions: z.array(z.strictObject({ category: z.enum(['Unstated Assumption', 'Uncertain Assumption', 'Needs Evidence', 'Emotional / Social', 'Short-term vs Long-term', 'Confirmation Bias']), text, explanation: text, question: text.min(1), warn: z.boolean(), grounding: groundingSchema })).max(8),
  blindspots: z.array(z.strictObject({ section: z.enum(sections), factor: text, why: text, relatesTo: text, question: text.min(1), priority: z.enum(['low', 'medium', 'high']), grounding: groundingSchema })).max(10),
  conflicts: z.array(z.strictObject({ headline: text, description: text, grounding: groundingSchema })).max(5),
  perspectives: z.array(z.strictObject({ label: z.enum(['Future Self', 'Person Affected', 'Risk-Focused', 'Opportunity-Focused', 'Neutral Observer']), questions: z.array(text.min(1)).max(3) })).max(5),
  reflection: z.strictObject({ topBlindspots: z.array(text).max(3), strongestAssumptions: list, unansweredQuestions: list, infoToGather: list, assumptionMatrix: z.array(z.strictObject({ assumption: text, ifTrue: text, ifFalse: text })).max(8), checklist: list }),
  limitations: list,
});
export const sourceSchema = z.strictObject({ id: z.uuid(), title: z.string().max(500), url: z.url().max(2048).refine(v => ['https:', 'http:'].includes(new URL(v).protocol)), excerpt: z.string().max(2000), retrieved_at: z.iso.datetime({ offset: true }) });
export type DecisionInput = z.infer<typeof decisionSchema>;
export type AnalysisOutput = z.infer<typeof analysisSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Question = { id: string; path: string; text: string };
export type Decision = DecisionInput & { id: string; user_id: string; revision: number; created_at: string; updated_at: string };
export type Reflection = { id: string; analysis_id: string; question_id: string; answer: string; question_text: string };
export type Snapshot = Decision & { reflections: Reflection[] };
export type Analysis = { id: string; decision_id: string; input_revision: number; input_snapshot: Snapshot; status: 'processing' | 'completed' | 'failed'; created_at: string; started_at: string; expires_at: string; completed_at: string | null; provider: string | null; model: string | null; research_status: string; error_code: string | null; output: AnalysisOutput | null; questions: Question[]; sources: Source[] };

export function validateGrounding(value: unknown, snapshot: Snapshot, sources: Source[]): AnalysisOutput {
  const result = analysisSchema.parse(value);
  if (new TextEncoder().encode(JSON.stringify(result)).length > 65536) throw new Error('OUTPUT_TOO_LARGE');
  const fields: Record<string, string> = Object.fromEntries(Object.keys(fieldLimits).map(k => [k, snapshot[k as keyof DecisionInput] as string]));
  for (const r of snapshot.reflections) fields[`reflection:${r.id}`] = r.answer;
  const ids = new Set(sources.map(s => sourceSchema.parse(s).id));
  for (const item of [...result.assumptions, ...result.blindspots, ...result.conflicts]) {
    const g = item.grounding;
    if (g.kind !== 'missing_information' && !g.inputQuotes.length) throw new Error('UNGROUNDED_FINDING');
    for (const q of g.inputQuotes) if (!fields[q.field]?.includes(q.quote)) throw new Error('INVALID_QUOTE');
    for (const id of g.sourceIds) if (!ids.has(id)) throw new Error('INVALID_SOURCE');
  }
  return result;
}
export function questionsFor(result: AnalysisOutput): Question[] {
  const questions: Question[] = [];
  const add = (path: string, text: string) => questions.push({ id: `q${questions.length + 1}`, path, text });
  result.assumptions.forEach((a, i) => add(`assumptions.${i}.question`, a.question));
  result.blindspots.forEach((a, i) => add(`blindspots.${i}.question`, a.question));
  result.perspectives.forEach((p, i) => p.questions.forEach((q, j) => add(`perspectives.${i}.questions.${j}`, q)));
  result.reflection.unansweredQuestions.forEach((q, i) => add(`reflection.unansweredQuestions.${i}`, q));
  return questions;
}
