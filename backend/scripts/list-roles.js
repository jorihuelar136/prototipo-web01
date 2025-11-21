import Database from 'better-sqlite3';
import path from 'path';
const dbPath = path.join(process.cwd(), 'data', 'app.db');
const db = new Database(dbPath);
const rows = db.prepare('SELECT id,name,menu_options FROM role_definitions').all();
console.log(rows);
