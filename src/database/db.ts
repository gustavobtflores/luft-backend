import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from './schema';

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

export const connection = {
  connect: async () => await client.connect(),
  close: async () => await client.end(),
};

export const connect = async () => await client.connect();
export const close = async () => await client.end();
export const db = drizzle(client, { schema });
