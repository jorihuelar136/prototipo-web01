import Database from 'better-sqlite3';
const db = new Database('data/app.db');
const tables = ['users','growth_plan_steps','prayer_requests','resources','community_posts'];
for(const t of tables){
  try {
    const row = db.prepare(`SELECT COUNT(*) as c FROM ${t}`).get();
    console.log(t, row);
  } catch(e){
    console.log(t,'ERR');
  }
}