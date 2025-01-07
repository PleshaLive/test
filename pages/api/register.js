// pages/api/register.js
import fs from 'fs';
import path from 'path';

// Функция чтения из db.json
function readDB() {
  const dbPath = path.join(process.cwd(), 'db.json');
  const raw = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(raw);
}

// Функция записи в db.json
function writeDB(data) {
  const dbPath = path.join(process.cwd(), 'db.json');
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

export default function handler(req, res) {
  if (req.method === 'POST') {
    // -- Сохранение/обновление пользователя --
    const { publicKey, nickname, twitter, tokenBalance } = req.body;

    if (!publicKey || tokenBalance === undefined || !nickname) {
      return res
        .status(400)
        .json({ error: 'Missing data (publicKey, nickname or tokenBalance)' });
    }

    const db = readDB();
    const users = db.users || [];

    const idx = users.findIndex((u) => u.publicKey === publicKey);
    if (idx === -1) {
      users.push({ publicKey, nickname, twitter, tokenBalance });
    } else {
      users[idx].nickname = nickname;
      users[idx].twitter = twitter;
      users[idx].tokenBalance = tokenBalance;
    }

    db.users = users;
    writeDB(db);

    return res.status(200).json({ message: 'User registered/updated' });
  } else if (req.method === 'GET') {
    // -- Проверка, есть ли пользователь в базе --
    const { publicKey } = req.query;
    if (!publicKey) {
      return res.status(400).json({ error: 'No publicKey provided' });
    }

    const db = readDB();
    const users = db.users || [];
    const user = users.find((u) => u.publicKey === publicKey);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    } else {
      return res.status(200).json(user);
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
