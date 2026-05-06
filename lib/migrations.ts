import fs from 'node:fs';
import path from 'node:path';
import type { Client } from '@libsql/client';

export async function runMigrations(db: Client) {
  const sqlPath = path.join(process.cwd(), 'sql', '001_init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  await db.execute('PRAGMA foreign_keys = ON;');
  await db.executeMultiple(sql);
}
