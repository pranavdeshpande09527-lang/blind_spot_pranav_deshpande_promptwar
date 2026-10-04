import { z } from 'zod';
import { decisionSchema, updateSchema, runSchema, answerSchema, analysisSchema } from './shared/schemas.js';
const json = (schema: unknown) => ({ 'application/json': { schema } });
const success = { type: 'object', required: ['data'], properties: { data: {} } };
const error = { type: 'object', required: ['error'], properties: { error: { type: 'object', required: ['code','message','requestId'], properties: { code: { type: 'string' }, message: { type: 'string' }, requestId: { type: 'string' }, analysisId: { type: 'string', format: 'uuid' } } } } };
const route = (summary: string, body?: z.ZodType, code = '200', parameters: unknown[] = []) => ({
  summary, security: [{ bearerAuth: [] }], parameters,
  ...(body ? { requestBody: { required: true, content: json(z.toJSONSchema(body)) } } : {}),
  responses: { [code]: { description: 'Success; persisted data envelope. See docs/api.md for the record fields.', content: json(success) }, ...Object.fromEntries([400,401,404,409,429,502,503,504].map(n => [n, { description: 'Safe error envelope', content: json(error) }])) },
});
const id = (name = 'id') => ({ name, in: 'path', required: true, schema: { type: 'string', format: 'uuid' } });
const paging = [{ name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 20 } }, { name: 'cursor', in: 'query', schema: { type: 'string', maxLength: 500 } }];
export const specification = {
  openapi: '3.1.0', info: { title: 'Third Eye API', version: '1.0.0', description: 'Owner-scoped decision storage and neutral analysis. Response record semantics are defined in docs/api.md and docs/contracts.md.' },
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'Supabase JWT' } }, schemas: { DecisionInput: z.toJSONSchema(decisionSchema), AnalysisOutput: z.toJSONSchema(analysisSchema), Error: error } },
  paths: {
    '/healthz': { get: { ...route('Liveness'), security: [], responses: { 200: { description: 'Process alive', content: json({ type: 'object', properties: { status: { const: 'ok' } } }) } } } },
    '/api/config': { get: { ...route('Public Supabase configuration and capabilities'), security: [] } },
    '/api/decisions': { get: route('List owned decisions', undefined, '200', paging), post: route('Create a decision', decisionSchema, '201') },
    '/api/decisions/{id}': { get: route('Read a decision', undefined, '200', [id()]), patch: route('Replace editable fields at expectedRevision', updateSchema, '200', [id()]), delete: route('Delete a decision and its children', undefined, '200', [id()]) },
    '/api/decisions/{id}/analyses': { get: route('List saved analysis summaries', undefined, '200', [id(), ...paging]), post: { ...route('Analyze a saved revision; replay returns 200 or 202', runSchema, '201', [id(), { name: 'Idempotency-Key', in: 'header', required: true, schema: { type: 'string', format: 'uuid' } }]), } },
    '/api/decisions/{id}/analyses/by-key/{key}': { get: route('Look up a durable run by request key', undefined, '200', [id(), id('key')]) },
    '/api/decisions/{id}/analyses/{analysisId}': { get: route('Read full output, questions, sources and snapshot', undefined, '200', [id(), id('analysisId')]) },
    '/api/decisions/{id}/reflections': { get: route('List saved answers', undefined, '200', [id()]) },
    '/api/decisions/{id}/reflections/{questionId}': { put: route('Save an answer and increment the decision revision', answerSchema, '200', [id(), { name: 'questionId', in: 'path', required: true, schema: { type: 'string', pattern: '^q\\d{1,2}$' } }]) },
  },
};
