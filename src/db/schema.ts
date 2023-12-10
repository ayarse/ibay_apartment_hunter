import { pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';

export const config = pgTable('config', {
  config_key: varchar('config_key', { length: 50 }).primaryKey(),
  config_value: varchar('config_value', { length: 50 }),
});

export const subscribers = pgTable('subscribers', {
  id: serial('id').primaryKey(),
  tg_id: varchar('tg_id', { length: 255 }).unique(),
  pref_location: varchar('pref_location', { length: 50 }).default('male'),
  created_at: timestamp('created_at').defaultNow(),
  deleted_at: timestamp('deleted_at'),
});

export type Config = typeof config.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
