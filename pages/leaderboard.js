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

  // Немного стилей
  const containerStyle = {
    minHeight: '100vh',
    background: '#f0f0f0',
    fontFamily: 'Arial, sans-serif',
    padding: '30px'
  };

  const cardStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  };

  const titleStyle = {
    textAlign: 'center',
    marginBottom: '20px'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px'
  };

  const thStyle = {
    border: '1px solid #ccc',
    padding: '8px',
    backgroundColor: '#eee'
  };

  const tdStyle = {
    border: '1px solid #ccc',
    padding: '8px',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Лидерборд</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Место</th>
              <th style={thStyle}>Ник</th>
              <th style={thStyle}>Public Key</th>
              <th style={thStyle}>Баланс токена</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.publicKey}>
                <td style={tdStyle}>{index + 1}</td>
                <td style={tdStyle}>{user.nickname}</td>
                <td style={tdStyle}>{user.publicKey}</td>
                <td style={tdStyle}>{user.tokenBalance}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link href="/">
            <button
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                background: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              На главную
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
