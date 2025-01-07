// pages/api/leaderboard.js
import { users } from './register';

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Сортируем по убыванию баланса
    const sorted = [...users].sort((a, b) => b.tokenBalance - a.tokenBalance);
    return res.status(200).json(sorted);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
