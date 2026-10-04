import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { z } from 'zod';
loadEnv({ path: '.env.local', quiet: true });
const optional = z.string().default('');
const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  APP_ORIGIN: z.url().default('http://localhost:3000'),
  SUPABASE_URL: optional, SUPABASE_PUBLISHABLE_KEY: optional,
  GEMINI_API_KEY: optional, GEMINI_MODEL: optional,
  GROQ_API_KEY: optional, GROQ_MODEL: optional, TAVILY_API_KEY: optional,
  ANALYSIS_SIGNING_SECRET: optional,
  ANALYSIS_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).default(45000),
  PROVIDER_TIMEOUT_MS: z.coerce.number().int().min(1000).max(60000).default(18000),
  MAX_ANALYSES_PER_USER_PER_HOUR: z.coerce.number().int().min(1).max(1000).default(12),
  MAX_CONCURRENT_ANALYSES: z.coerce.number().int().min(1).max(20).default(3),
});
export type Config = z.infer<typeof schema>;
export function readConfig(env = process.env): Config {
  const parsed = schema.safeParse({ ...env, SUPABASE_URL: env.SUPABASE_URL || env.Supabase_url });
  if (!parsed.success) throw new Error(`Invalid configuration: ${parsed.error.issues.map(i => i.path.join('.')).join(', ')}`);
  const config = parsed.data;
  if (config.SUPABASE_URL && !z.url().safeParse(config.SUPABASE_URL).success) throw new Error('Invalid SUPABASE_URL');
  if (config.SUPABASE_URL) {
    const url = new URL(config.SUPABASE_URL);
    if (!['/', '/rest/v1', '/rest/v1/'].includes(url.pathname) || url.search || url.hash || url.username || url.password) throw new Error('SUPABASE_URL must be the project origin or Data API URL');
    config.SUPABASE_URL = url.origin;
  }
  if (config.ANALYSIS_SIGNING_SECRET && config.ANALYSIS_SIGNING_SECRET.length < 32) throw new Error('ANALYSIS_SIGNING_SECRET must contain at least 32 characters');
  if (config.NODE_ENV === 'production') {
    const missing = missingConfig(config);
    if (missing.length) throw new Error(`Missing configuration: ${missing.join(', ')}`);
    if (!config.APP_ORIGIN.startsWith('https://') || !config.SUPABASE_URL.startsWith('https://')) throw new Error('Production requires HTTPS origins');
  }
  return config;
}
export function missingConfig(config: Config): string[] {
  return (['SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY', 'GEMINI_API_KEY', 'GEMINI_MODEL', 'ANALYSIS_SIGNING_SECRET'] as const).filter(k => !config[k]);
}
