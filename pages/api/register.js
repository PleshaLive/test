// pages/api/register.js
import { query } from '../../lib/db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { publicKey, nickname, twitter, tokenBalance } = req.body;
    if (!publicKey || !nickname || tokenBalance === undefined) {
      return res.status(400).json({ error: 'Missing data (publicKey, nickname, tokenBalance)' });
    }

    try {
      // Вставляем или обновляем (ON CONFLICT по PRIMARY KEY = public_key)
      const sql = `
        INSERT INTO users (public_key, nickname, twitter, token_balance)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (public_key)
        DO UPDATE SET
          nickname = EXCLUDED.nickname,
          twitter = EXCLUDED.twitter,
          token_balance = EXCLUDED.token_balance
        RETURNING *;
      `;
      const params = [publicKey, nickname, twitter, tokenBalance];
      const result = await query(sql, params);
      return res.status(200).json({
        message: 'User registered/updated',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('DB error:', error);
      return res.status(500).json({ error: error.message });
    }

  } else if (req.method === 'GET') {
    // Проверяем наличие пользователя по publicKey
    const { publicKey } = req.query;
    if (!publicKey) {
      return res.status(400).json({ error: 'No publicKey provided' });
    }

    try {
      const sql = `SELECT * FROM users WHERE public_key=$1`;
      const result = await query(sql, [publicKey]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('DB error:', error);
      return res.status(500).json({ error: error.message });
    }

  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
