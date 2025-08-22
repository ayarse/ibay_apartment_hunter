import { and, count, eq, isNull, or } from 'drizzle-orm';
import { db } from '../db';
import type { Subscriber } from '../db/schema';
import { subscribers } from '../db/schema';

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
      is_blocked: false,
    })
    .onConflictDoUpdate({
      target: subscribers.tg_id,
      set: {
        tg_id: id,
        deleted_at: null,
        is_blocked: false,
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

export const getUsersByPref = async (pref: string): Promise<Subscriber[]> => {
  const res = await db
    .select()
    .from(subscribers)
    .where(
      and(
        eq(subscribers.pref_location, pref),
        isNull(subscribers.deleted_at),
        or(isNull(subscribers.is_blocked), eq(subscribers.is_blocked, false)),
      ),
    );

  return res;
};

export const getAllSubscribers = async (): Promise<Subscriber[]> => {
  const res = await db
    .select()
    .from(subscribers)
    .where(
      and(
        isNull(subscribers.deleted_at),
        or(isNull(subscribers.is_blocked), eq(subscribers.is_blocked, false)),
      ),
    );

  return res;
};

export const blockUser = async (id: string): Promise<void> => {
  await db
    .update(subscribers)
    .set({ is_blocked: true })
    .where(eq(subscribers.tg_id, id));
};

export const unblockUser = async (id: string): Promise<void> => {
  await db
    .update(subscribers)
    .set({ is_blocked: false })
    .where(eq(subscribers.tg_id, id));
};
