import { TickerType } from '@src/services/investments';
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
  TickerType.bdr,
  TickerType.crypto,
  TickerType.stock,
  TickerType.reit,
]);

export const transactionType = pgEnum('transaction_type', ['buy', 'sell']);

export const transactionsSchema = pgTable('transactions', {
  id: serial('id').primaryKey(),
  ticker: varchar('ticker', { length: 20 }).notNull(),
  avgPrice: numeric('avg_price', { precision: 19, scale: 8 }).notNull(),
  quantity: numeric('quantity', { precision: 19, scale: 8 }).notNull(),
  tickerType: tickerTypeEnum('ticker_type').notNull(),
  type: tickerTypeEnum('type').notNull(),
  date: date('date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});
