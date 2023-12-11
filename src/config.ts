import dotenv from 'dotenv';
import { parseEnv } from 'znv';
import { z } from 'zod';

dotenv.config();

export const env = parseEnv(process.env, {
  DEBUG: z.boolean().default(true),
  DEBUG_USER: z.string(),
  TIME_INTERVAL: z.number().default(10),

  TELEGRAM_TOKEN: z.string(),
  SENTRY_DSN: z.string(),
  DATABASE_URL: z.string(),

  POSTGRES_PASSWORD: z.string().optional(),
  POSTGRES_USER: z.string().optional(),
  POSTGRES_DB: z.string().optional(),
  POSTGRES_PORT: z.string().optional(),
});

export default env;
