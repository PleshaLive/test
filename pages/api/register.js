// pages/api/register.js
import fs from 'fs';
import path from 'path';

function readDB() {
  const dbPath = path.join(process.cwd(), 'db.json');
  const raw = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(raw);
}

function writeDB(data) {
  const dbPath = path.join(process.cwd(), 'db.json');
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { publicKey, tokenBalance, nickname } = req.body;

    if (!publicKey || tokenBalance === undefined || !nickname) {
      return res.status(400).json({ error: 'Missing data (publicKey, tokenBalance or nickname)' });
    }

    // Читаем текущее состояние
    const db = readDB();
    const users = db.users || [];

    // Ищем, есть ли уже такой пользователь
    const existingIndex = users.findIndex((u) => u.publicKey === publicKey);
    if (existingIndex === -1) {
      // Добавляем нового
      users.push({ publicKey, tokenBalance, nickname });
    } else {
      // Обновляем поля
      users[existingIndex].tokenBalance = tokenBalance;
      users[existingIndex].nickname = nickname;
    }

    // Сохраняем обратно
    db.users = users;
    writeDB(db);

    return res.status(200).json({ message: 'User registered/updated' });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
