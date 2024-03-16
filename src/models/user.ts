import { db } from '@src/database/db';
import { users } from '@src/database/schema';
import { AuthService } from '@src/services/auth';
import { SQL, and, eq } from 'drizzle-orm';

export const findOne = async ({ ...fields }: Partial<User>) => {
  const filters = Object.entries(fields).reduce((acc, [key, value]) => {
    acc.push(eq(users[key as keyof User], value));

    return acc;
  }, [] as SQL<unknown>[]);

  const user = await db
    .select()
    .from(users)
    .where(and(...filters));

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
