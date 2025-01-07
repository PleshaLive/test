// pages/leaderboard.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/leaderboard')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Ошибка HTTP: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => {
        console.error(err);
        setError('Ошибка при получении списка пользователей.');
      });
  }, []);

  return (
    <div style={{ padding: '40px', background: '#1c1f3f', color: '#fff', minHeight: '100vh' }}>
      <h1>Лидерборд (Neon DB)</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#333' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #fff', padding: '8px' }}>Место</th>
            <th style={{ border: '1px solid #fff', padding: '8px' }}>Public Key</th>
            <th style={{ border: '1px solid #fff', padding: '8px' }}>Ник</th>
            <th style={{ border: '1px solid #fff', padding: '8px' }}>Twitter</th>
            <th style={{ border: '1px solid #fff', padding: '8px' }}>Баланс</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.public_key}>
              <td style={{ border: '1px solid #fff', padding: '8px', textAlign: 'center' }}>{i + 1}</td>
              <td style={{ border: '1px solid #fff', padding: '8px' }}>{u.public_key}</td>
              <td style={{ border: '1px solid #fff', padding: '8px' }}>{u.nickname}</td>
              <td style={{ border: '1px solid #fff', padding: '8px' }}>{u.twitter || '-'}</td>
              <td style={{ border: '1px solid #fff', padding: '8px', textAlign: 'right' }}>{u.token_balance}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <Link href="/">
          <button>На главную</button>
        </Link>
      </div>
    </div>
  );
}
