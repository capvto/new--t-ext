import fs from 'node:fs';
import path from 'node:path';
import { getDatabasePath } from '@/lib/db';

export function createBackup() {
  const dbPath = getDatabasePath();
  const dataDir = path.dirname(dbPath);
  const backupDir = path.join(dataDir, 'backups');
  const stamp = new Date().toISOString().slice(0, 10);
  const target = path.join(backupDir, `text-${stamp}.sqlite`);

  fs.mkdirSync(backupDir, { recursive: true });
  fs.copyFileSync(dbPath, target);

  return target;
}
