// pages/api/leaderboard.js
import fs from 'fs';
import path from 'path';

function readDB() {
  const dbPath = path.join(process.cwd(), 'db.json');
  const raw = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(raw);
}

export default function handler(req, res) {
  if (req.method === 'GET') {
    const db = readDB();
    const users = db.users || [];
    // Сортируем по убыванию баланса
    const sorted = [...users].sort((a, b) => b.tokenBalance - a.tokenBalance);
    return res.status(200).json(sorted);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
