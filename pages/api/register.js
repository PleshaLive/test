// pages/api/register.js
import fs from 'fs';
import path from 'path';

// Функция чтения из db.json
function readDB() {
  const dbPath = path.join(process.cwd(), 'db.json'); 
  const raw = fs.readFileSync(dbPath, 'utf8');      // читаем файл
  return JSON.parse(raw);                           // парсим в объект
}

// Функция записи в db.json
function writeDB(data) {
  const dbPath = path.join(process.cwd(), 'db.json');
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { publicKey, tokenBalance } = req.body;

    if (!publicKey || tokenBalance === undefined) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Читаем текущее состояние из db.json
    const db = readDB(); 
    // Если db.json содержит поле "users", берём его, иначе создаём пустой массив
    const users = db.users || [];

    // Ищем, есть ли уже такой пользователь
    const existingUserIndex = users.findIndex((u) => u.publicKey === publicKey);

    if (existingUserIndex === -1) {
      // Добавляем нового пользователя
      users.push({ publicKey, tokenBalance });
    } else {
      // Обновляем баланс
      users[existingUserIndex].tokenBalance = tokenBalance;
    }

    // Перезаписываем db.json
    const newDB = { ...db, users };  // сохраняем всех пользователей
    writeDB(newDB);

    return res.status(200).json({ message: 'User registered/updated' });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
