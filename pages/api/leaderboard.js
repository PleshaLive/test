// pages/api/leaderboard.js
import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const sql = `SELECT * FROM users ORDER BY token_balance DESC`;
      const result = await query(sql);
      return res.status(200).json(result.rows);
    } catch (error) {
      console.error('DB error:', error);
      return res.status(500).json({ error: error.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
