import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, connection } from './db';

async function main() {
  await connection.connect();

  console.log('Running migrations');

  await migrate(db, { migrationsFolder: 'src/database/migrations' });

  console.log('Migrated successfully');

  await connection.close();

  process.exit(0);
}

main().catch((err) => {
  console.log('Migration failed');
  console.error(err);
  process.exit(1);
});
