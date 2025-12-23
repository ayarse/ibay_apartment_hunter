import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { config } from '@/db/schema';

export const getConfigByKey = async (
  key: string,
): Promise<string | undefined> => {
  const res = await db
    .select({
      value: config.config_value,
    })
    .from(config)
    .where(eq(config.config_key, key))
    .limit(1);

  return res[0]?.value;
};

export const setConfig = async (key: string, value: string) => {
  return await db
    .insert(config)
    .values({
      config_key: key,
      config_value: value,
    })
    .onConflictDoUpdate({
      target: config.config_key,
      set: {
        config_value: value,
      },
    });
};
