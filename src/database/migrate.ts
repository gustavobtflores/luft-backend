import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, connection } from './db';
import logger from '../logger';

export async function runMigration() {
  await connection.connect();

  logger.info('Running database migrations');

  await migrate(db, { migrationsFolder: 'src/database/migrations' });

  logger.info('Database migrated successfully');

  await connection.close();

  process.exit(0);
}

runMigration().catch((err) => {
  logger.error(`Migration failed with error: ${err}`);
  process.exit(1);
});
