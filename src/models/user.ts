import { db } from '@src/database/db';
import { users } from '@src/database/schema';
import { AuthService } from '@src/services/auth';
import { SQL, and, eq } from 'drizzle-orm';
import { PgColumn } from 'drizzle-orm/pg-core';

interface FindOne {
  filters: Partial<User>;
  columns?: (keyof User)[];
}

export const findOne = async ({
  filters,
  columns = ['email', 'id', 'name', 'password'],
}: FindOne) => {
  const where = Object.entries(filters).reduce((acc, [key, value]) => {
    acc.push(eq(users[key as keyof User], value));

    return acc;
  }, [] as SQL<unknown>[]);

  const select = columns.reduce(
    (acc, col) => {
      acc[col] = users[col];

      return acc;
    },
    {} as Record<string, PgColumn>
  );

  const user = await db
    .select(select)
    .from(users)
    .where(and(...where));

  return user[0];
};

type NewUser = typeof users.$inferInsert;

export interface User extends NewUser {}

export const create = async (user: User) => {
  const hashedPassword = await AuthService.hashPassword(user.password);
  const newUser = {
    ...user,
    password: hashedPassword,
  };

  const queryReturn = await db.insert(users).values(newUser).returning();

  return queryReturn[0];
};

export const remove = () => {
  return db.delete(users);
};
