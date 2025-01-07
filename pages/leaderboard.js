// pages/leaderboard.js
import { useEffect, useState } from 'react';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  // При загрузке страницы делаем запрос на наш API
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
    <div style={{ padding: '20px' }}>
      <h1>Лидерборд</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Место</th>
            <th>Public Key</th>
            <th>Баланс токена</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.publicKey}>
              <td>{index + 1}</td>
              <td>{user.publicKey}</td>
              <td>{user.tokenBalance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
