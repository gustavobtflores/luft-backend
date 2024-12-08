import { db } from './db';

import { generateMigration, generateDrizzleJson } from 'drizzle-kit/api';

import * as schema from './schema';

const prevSchema = {};

export async function pushMigration() {
  const migrationStatements = await generateMigration(
    generateDrizzleJson(prevSchema),
    generateDrizzleJson(schema)
  );

  return db.execute(migrationStatements.join('\n'));
}
