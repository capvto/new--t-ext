import fs from 'node:fs';
import path from 'node:path';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const dbPath = process.env.SQLITE_PATH || path.join(dataDir, 'text.db');
const backupDir = path.join(dataDir, 'backups');
const stamp = new Date().toISOString().slice(0, 10);
const target = path.join(backupDir, `text-${stamp}.sqlite`);

if (!fs.existsSync(dbPath)) {
  console.error(`Database not found: ${dbPath}`);
  process.exit(1);
}

fs.mkdirSync(backupDir, { recursive: true });
fs.copyFileSync(dbPath, target);
console.log(target);
