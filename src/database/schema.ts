import {
  date,
  numeric,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const tickerTypeEnum = pgEnum('ticker_type', [
  'bdr',
  'crypto',
  'stock',
  'reit',
]);

export const transactionType = pgEnum('transaction_type', ['buy', 'sell']);

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  ticker: varchar('ticker', { length: 20 }).notNull(),
  price: numeric('price', { precision: 19, scale: 8 }).notNull(),
  quantity: numeric('quantity', { precision: 19, scale: 8 }).notNull(),
  tickerType: tickerTypeEnum('ticker_type').notNull(),
  type: transactionType('type').notNull(),
  date: date('date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});
