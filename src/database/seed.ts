import 'dotenv/config';
import { transactions, users } from './schema';
import { connection } from './db';
import { db } from './db';
import { AuthService } from '../services/auth';

async function main() {
  await connection.connect();

  await db.delete(users);
  await db.delete(transactions);

  const password = await AuthService.hashPassword('rapaz');

  await db.insert(users).values([
    {
      email: 'john@example.com',
      name: 'John Doe',
      password: password,
      id: 'a41a076c-afd8-40d9-95bf-1df6b4cde0cc',
    },
  ]);

  await db.insert(transactions).values([
    {
      userId: 'a41a076c-afd8-40d9-95bf-1df6b4cde0cc',
      price: 257414.42,
      quantity: 0.002762,
      ticker: 'BTC',
      tickerType: 'crypto',
      type: 'buy',
    },
  ]);

  await connection.close();
}

main();
