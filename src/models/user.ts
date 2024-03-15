import { db } from '@src/database/db';
import { users } from '@src/database/schema';
import { AuthService } from '@src/services/auth';
import { z } from 'zod';

export const userSchema = z.object({});

export const find = () => {
  return db.query.users.findMany();
};

type NewUser = typeof users.$inferInsert;

interface User extends NewUser {}

export const create = async (user: User) => {
  const hashedPassword = await AuthService.hashPassword(user.password);
  const newUser = {
    ...user,
    password: hashedPassword,
  };

  return db.insert(users).values(newUser).returning();
};

export const remove = () => {
  return db.delete(users);
};
