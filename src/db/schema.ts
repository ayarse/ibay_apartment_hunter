import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const config = pgTable('config', {
  config_key: varchar('config_key', { length: 50 }).primaryKey(),
  config_value: varchar('config_value', { length: 50 }),
});

export const subscribers = pgTable('subscribers', {
  id: serial('id').primaryKey(),
  tg_id: varchar('tg_id', { length: 255 }).unique(),
  pref_location: varchar('pref_location', { length: 50 }).default('Male'),
  created_at: timestamp('created_at').defaultNow(),
  deleted_at: timestamp('deleted_at'),
  is_blocked: boolean('is_blocked').default(null),
});

export const listings = pgTable('listings', {
  id: serial('id').primaryKey(),
  ibay_id: integer('ibay_id').unique(),
  title: varchar('title', { length: 255 }),
  url: varchar('url', { length: 255 }),
  price: varchar('price', { length: 255 }),
  location: varchar('location', { length: 255 }),
  raw_data: text('raw_data'),
  parsed_data: jsonb('parsed_data'),
  created_at: timestamp('created_at').defaultNow(),
});

export type Config = typeof config.$inferSelect;
export type Subscriber = typeof subscribers.$inferSelect;
export type Listing = typeof listings.$inferSelect;
