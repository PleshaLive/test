// pages/api/register.js

let users = []; 
// В реальном проекте используйте БД вместо массива в памяти

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { publicKey, tokenBalance } = req.body;

    if (!publicKey || tokenBalance === undefined) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Ищем, есть ли уже такой пользователь
    const existingUserIndex = users.findIndex((u) => u.publicKey === publicKey);

    if (existingUserIndex === -1) {
      // Добавляем нового пользователя
      users.push({ publicKey, tokenBalance });
    } else {
      // Обновляем баланс
      users[existingUserIndex].tokenBalance = tokenBalance;
    }

    return res.status(200).json({ message: 'User registered/updated' });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

export { users };
