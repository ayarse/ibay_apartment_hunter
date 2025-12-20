import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  DEBUG: z.coerce.boolean().default(true),
  DEBUG_USER: z.string(),
  TIME_INTERVAL: z.coerce.number().default(10),

  TELEGRAM_TOKEN: z.string(),
  SENTRY_DSN: z.string(),
  DATABASE_URL: z.string(),
  IBAY_BASE_URL: z.string(),
  OPENROUTER_API_KEY: z.string(),

  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_USER: z.string().optional(),
  POSTGRES_DB: z.string().optional(),
  POSTGRES_PORT: z.string().optional(),
});

export const env = envSchema.parse(process.env);
