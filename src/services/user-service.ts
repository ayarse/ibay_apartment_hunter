import { and, count, eq, isNull } from 'drizzle-orm';
import { db } from '../clients';
import { Subscriber, subscribers } from '../db/schema';

export const hasSubscriber = async (id: string): Promise<boolean> => {
  const res = await db
    .select()
    .from(subscribers)
    .where(and(eq(subscribers.tg_id, id), isNull(subscribers.deleted_at)))
    .limit(1);

  return res.length > 0;
};

export const addSubscriber = async (id: string): Promise<boolean> => {
  await db
    .insert(subscribers)
    .values({
      tg_id: id,
      deleted_at: null,
    })
    .onConflictDoUpdate({
      target: subscribers.tg_id,
      set: {
        tg_id: id,
        deleted_at: null,
      },
    });

  return true;
};

export const removeSubscriber = async (id: string): Promise<boolean> => {
  const res = await db
    .update(subscribers)
    .set({
      deleted_at: new Date(),
    })
    .where(eq(subscribers.tg_id, id));

  return Boolean(res);
};

export const updateUserLocationPref = async (
  id: string,
  prefLocation: string,
): Promise<boolean> => {
  const res = await db
    .update(subscribers)
    .set({
      pref_location: prefLocation,
    })
    .where(eq(subscribers.tg_id, id));

  return Boolean(res);
};

export const countUsers = async (): Promise<number> => {
  const res = await db
    .select({
      count: count(),
    })
    .from(subscribers);

  return res[0].count;
};

export const getSubscriber = async (id: string): Promise<Subscriber> => {
  const res = await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.tg_id, id))
    .limit(1);

  return res[0];
};
