// lib/db.js
import { Pool } from 'pg';

// Берём строку подключения из переменной окружения
const connectionString = process.env.DATABASE_URL; 
if (!connectionString) {
  throw new Error('DATABASE_URL is not set in env');
}

// Создаём пул подключений
const pool = new Pool({
  connectionString,
});

// Универсальная функция для запросов
export async function query(q, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(q, params);
    return result;
  } finally {
    client.release();
  }
}
