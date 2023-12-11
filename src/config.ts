import dotenv from 'dotenv';
import { parseEnv } from 'znv';
import { z } from 'zod';

dotenv.config();

export const env = parseEnv(process.env, {
  DEBUG: z.boolean().default(true),
  DEBUG_USER: z.string(),
  DEBUG_LAST_CHECKED: z.string(),
  TIME_INTERVAL: z.number().default(10),

  TELEGRAM_TOKEN: z.string(),
  SENTRY_DSN: z.string(),

  DATABASE_URL: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_DB: z.string(),
  POSTGRES_PORT: z.string(),
});

// export const scrapers = [
//   new IbayScraper('all'),
//   new IbayScraper('male'),
//   new IbayScraper('hulhumale'),
//   new IbayScraper('villigili'),
// ];

export default env;
