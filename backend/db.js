// db.js
// A tiny JSON-file-backed "database". No native modules, no compilation
// needed - just plain Node.js reading/writing a JSON file. Good enough
// for a learning project; a real app would use Postgres/MySQL/SQLite,
// but those require extra setup that isn't worth fighting on Windows
// for a first project.

const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'data.json');

function loadData() {
  if (!fs.existsSync(DB_FILE)) {
    return { users: [], expenses: [], nextUserId: 1, nextExpenseId: 1 };
  }
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

function saveData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

module.exports = { loadData, saveData };
