import { db } from '@src/database/db';
import { transactions } from '@src/database/schema';
import { z } from 'zod';

export enum TickerType {
  bdr = 'bdr',
  stock = 'stock',
  crypto = 'crypto',
  reit = 'reit',
}

export enum TransactionType {
  buy = 'buy',
  sell = 'sell',
}

type NewTransaction = typeof transactions.$inferInsert;

export interface Transaction
  extends Omit<NewTransaction, 'price' | 'quantity'> {
  price: number;
  quantity: number;
}

export const transactionSchema = z.object({
  ticker: z.string(),
  price: z.number(),
  quantity: z.number(),
  tickerType: z.enum(['bdr', 'stock', 'crypto', 'reit']),
  type: z.enum(['buy', 'sell']),
  date: z.coerce.date().optional(),
});

export const create = async (transaction: NewTransaction) => {
  return db.insert(transactions).values(transaction).returning();
};

export const remove = () => {
  return db.delete(transactions);
};
