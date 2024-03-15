import {
  customType,
  date,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const tickerTypeEnum = pgEnum('ticker_type', [
  'bdr',
  'crypto',
  'stock',
  'reit',
]);

export const transactionType = pgEnum('transaction_type', ['buy', 'sell']);

const decimalNumber = customType<{ data: number }>({
  dataType() {
    return 'numeric(19, 8)';
  },
  fromDriver(value) {
    return Number(value);
  },
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  ticker: varchar('ticker', { length: 20 }).notNull(),
  price: decimalNumber('price', { precision: 19, scale: 8 }).notNull(),
  quantity: decimalNumber('quantity', { precision: 19, scale: 8 }).notNull(),
  tickerType: tickerTypeEnum('ticker_type').notNull(),
  type: transactionType('type').notNull(),
  date: date('date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: text('password').notNull(),
});
