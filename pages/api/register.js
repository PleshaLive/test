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
    const { publicKey, nickname, tokenBalance, twitter } = req.body;

    // Проверяем обязательные поля
    if (!publicKey || !nickname || tokenBalance === undefined) {
      return res
        .status(400)
        .json({ error: 'Missing data: publicKey, nickname, or tokenBalance' });
    }
    // twitter может быть "", это не ошибка.

    // Читаем текущее состояние db.json
    const db = readDB();
    const users = db.users || [];

    // Ищем, есть ли уже такой publicKey
    const existingIndex = users.findIndex((u) => u.publicKey === publicKey);
    if (existingIndex === -1) {
      // Добавляем нового пользователя
      users.push({ publicKey, nickname, twitter, tokenBalance });
    } else {
      // Обновляем
      users[existingIndex].nickname = nickname;
      users[existingIndex].twitter = twitter;
      users[existingIndex].tokenBalance = tokenBalance;
    }

    db.users = users;
    writeDB(db);

    return res.status(200).json({ message: 'User registered/updated' });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
