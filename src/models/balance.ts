import { db } from '@src/database/db';
import { balances } from '@src/database/schema';
import { eq } from 'drizzle-orm';

type NewBalance = typeof balances.$inferInsert;

export interface Transaction extends NewBalance {}

export const create = (balance: NewBalance) => {
  return db.insert(balances).values(balance);
};

export const find = ({ userId }: { userId: string | undefined }) => {
  return db.query.balances.findMany({
    where: eq(balances.userId, userId as string),
  });
};
