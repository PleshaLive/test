// pages/api/register.js
import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { publicKey, nickname, twitter, tokenBalance } = req.body;
    if (!publicKey || tokenBalance === undefined || !nickname) {
      return res.status(400).json({ error: 'Missing data' });
    }

    try {
      // Попробуем найти существующего пользователя
      const { data: existing, error: errorSelect } = await supabase
        .from('users')
        .select('*')
        .eq('publicKey', publicKey)
        .single(); // single() если точно 1 или 0 строк

      if (errorSelect && errorSelect.code !== 'PGRST116') {
        // Если это не "Row not found" (код может отличаться), возвращаем ошибку
        return res.status(500).json({ error: errorSelect.message });
      }

      let result;
      if (!existing) {
        // Создаём нового
        const { data: inserted, error: errorInsert } = await supabase
          .from('users')
          .insert([{ publicKey, nickname, twitter, tokenBalance }])
          .select()
          .single();
        if (errorInsert) {
          return res.status(500).json({ error: errorInsert.message });
        }
        result = inserted;
      } else {
        // Обновляем
        const { data: updated, error: errorUpdate } = await supabase
          .from('users')
          .update({ nickname, twitter, tokenBalance })
          .eq('publicKey', publicKey)
          .select()
          .single();
        if (errorUpdate) {
          return res.status(500).json({ error: errorUpdate.message });
        }
        result = updated;
      }

      return res.status(200).json({ message: 'User registered/updated', user: result });
    } catch (err) {
      console.error('Supabase error:', err);
      return res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'GET') {
    // Если хотите GET — ищем пользователя по ?publicKey=...
    const { publicKey } = req.query;
    if (!publicKey) {
      return res.status(400).json({ error: 'No publicKey provided' });
    }
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('publicKey', publicKey)
        .single();
      if (error) {
        // Если row not found — вернём 404
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json(user);
    } catch (err) {
      console.error('Supabase GET error:', err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
