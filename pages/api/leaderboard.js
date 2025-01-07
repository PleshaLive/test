// pages/leaderboard.js
import { useEffect, useState } from 'react';
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

  // Стили (можно и общие делать, для примера используем inline)
  const containerStyle = {
    minHeight: '100vh',
    background: '#1c1f3f',
    color: '#fff',
    fontFamily: 'Trebuchet MS, sans-serif',
    padding: '40px'
  };

  const titleStyle = {
    textAlign: 'center',
    fontSize: '2.5rem',
    marginBottom: '20px'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px'
  };

  const thStyle = {
    border: '1px solid #ccc',
    padding: '10px',
    background: '#3e2d4a'
  };

  const tdStyle = {
    border: '1px solid #ccc',
    padding: '10px',
    textAlign: 'center'
  };

  const btnStyle = {
    display: 'inline-block',
    marginTop: '20px',
    padding: '10px 20px',
    background: '#74cba1',
    color: '#000',
    textDecoration: 'none',
    borderRadius: '20px'
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Лидерборд</h1>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Место</th>
            <th style={thStyle}>Ник</th>
            <th style={thStyle}>Twitter</th>
            <th style={thStyle}>Public Key</th>
            <th style={thStyle}>Баланс токена</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.publicKey}>
              <td style={tdStyle}>{index + 1}</td>
              <td style={tdStyle}>{user.nickname}</td>
              <td style={tdStyle}>{user.twitter || '-'}</td>
              <td style={tdStyle}>{user.publicKey}</td>
              <td style={tdStyle}>{user.tokenBalance}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign: 'center' }}>
        <Link href="/">
          <a style={btnStyle}>Вернуться на главную</a>
        </Link>
      </div>
    </div>
  );
}
