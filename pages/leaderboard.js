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

  const containerStyle = {
    minHeight: '100vh',
    background: '#1c1f3f',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
    padding: '40px'
  };
  const titleStyle = {
    fontSize: '2rem',
    marginBottom: '20px'
  };
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
  };
  const thStyle = {
    border: '1px solid #ccc',
    padding: '10px',
    background: '#333'
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
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer'
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Лидерборд</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Место</th>
            <th style={thStyle}>Ник</th>
            <th style={thStyle}>Twitter</th>
            <th style={thStyle}>Public Key</th>
            <th style={thStyle}>Баланс</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, i) => (
            <tr key={u.publicKey}>
              <td style={tdStyle}>{i + 1}</td>
              <td style={tdStyle}>{u.nickname}</td>
              <td style={tdStyle}>{u.twitter || '-'}</td>
              <td style={tdStyle}>{u.publicKey}</td>
              <td style={tdStyle}>{u.tokenBalance}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        <Link href="/">
          <button style={btnStyle}>На главную</button>
        </Link>
      </div>
    </div>
  );
}
