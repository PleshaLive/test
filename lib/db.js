// lib/db.js

import { Pool } from 'pg';

// Для простоты используем Pool. В Neon можно и Client.
// Read connection string from env:
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set!");
}

// Создаём пул подключений:
const pool = new Pool({
  connectionString,
});

// Экспортируем функцию для запросов:
export async function query(q, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(q, params);
    return result;
  } finally {
    client.release();
  }
}
