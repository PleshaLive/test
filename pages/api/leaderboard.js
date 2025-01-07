// pages/api/leaderboard.js
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        // можете добавить .order('tokenBalance', { ascending: false }) 
        // если хотите сортировать прямо на уровне запроса
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      // Можно тут же сортировать вручную
      const sorted = data.sort((a, b) => b.tokenBalance - a.tokenBalance);
      return res.status(200).json(sorted);
    } catch (err) {
      console.error('Supabase leaderboard error:', err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
