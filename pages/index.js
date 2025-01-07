// pages/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Connection, PublicKey } from '@solana/web3.js';

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [message, setMessage] = useState('');

  // Поля регистрации
  const [nickname, setNickname] = useState('');
  const [twitter, setTwitter] = useState('');

  // Флаг: пользователь зарегистрирован?
  const [isRegistered, setIsRegistered] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const TOKEN_MINT = "3EnxSbUszY4XPDfmWRJa3jkBUX4Dn8rdh4ZkNQCwpump";
  const SOLANA_RPC_ENDPOINT = "https://rpc.ankr.com/solana/3226dc3c471ff22f8355da4308ddd4a219b5ad67a62557acde28a539b94a550e";

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.solana?.isPhantom) {
        setMessage('Phantom найден. Подключите кошелёк!');
      } else {
        setMessage('Установите Phantom');
      }
    }
  }, []);

  const connectPhantom = async () => {
    try {
      const resp = await window.solana.connect();
      setWalletConnected(true);
      const pubKey = resp.publicKey.toString();
      setPublicKey(pubKey);

      setMessage(`Phantom подключён: ${pubKey}`);
      const bal = await getTokenBalance(resp.publicKey);
      setTokenBalance(bal);

      // Проверяем наличие в базе
      checkUser(pubKey);
    } catch (error) {
      console.error(error);
      setMessage('Ошибка при подключении');
    }
  };

  const checkUser = async (pubKey) => {
    try {
      const res = await fetch(`/api/register?publicKey=${pubKey}`);
      if (!res.ok) {
        if (res.status === 404) {
          setIsRegistered(false);
          setUserInfo(null);
        } else {
          throw new Error(`HTTP error: ${res.status}`);
        }
      } else {
        const data = await res.json();
        setIsRegistered(true);
        setUserInfo(data);
      }
    } catch (err) {
      console.error('checkUser error:', err);
      setIsRegistered(false);
      setUserInfo(null);
    }
  };

  const getTokenBalance = async (pubKeyObj) => {
    try {
      const connection = new Connection(SOLANA_RPC_ENDPOINT);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        pubKeyObj,
        { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
      );
      const accInfo = tokenAccounts.value.find(
        (acc) => acc.account.data.parsed.info.mint === TOKEN_MINT
      );
      if (!accInfo) return 0;
      return accInfo.account.data.parsed.info.tokenAmount.uiAmount || 0;
    } catch (err) {
      console.error(err);
      return 0;
    }
  };

  const handleRegister = async () => {
    if (!publicKey) {
      setMessage('Подключите кошелёк!');
      return;
    }
    if (!nickname) {
      setMessage('Введите ник!');
      return;
    }
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey,
          nickname,
          twitter,
          tokenBalance
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage('Ошибка при регистрации: ' + data.error);
      } else {
        setMessage('Успешно зарегистрирован/обновлён');
        setIsRegistered(true);
        setUserInfo({
          public_key: publicKey,
          nickname,
          twitter,
          token_balance: tokenBalance
        });
      }
    } catch (err) {
      console.error(err);
      setMessage('Ошибка при регистрации');
    }
  };

  const disconnectPhantom = () => {
    setWalletConnected(false);
    setPublicKey(null);
    setTokenBalance(0);
    setNickname('');
    setTwitter('');
    setIsRegistered(false);
    setUserInfo(null);
    setMessage('Кошелёк отключён (локально)');
  };

  // Простейшие стили
  const containerStyle = {
    padding: '40px',
    background: '#1c1f3f',
    color: '#fff',
    minHeight: '100vh'
  };

  return (
    <div style={containerStyle}>
      <h1>Главная страница (Neon PostgreSQL)</h1>
      <p>{message}</p>

      {!walletConnected && (
        <button onClick={connectPhantom}>Подключить Phantom</button>
      )}

      {walletConnected && (
        <>
          <p><b>Public Key:</b> {publicKey}</p>
          <p><b>Баланс токена:</b> {tokenBalance}</p>

          {isRegistered && userInfo ? (
            <div style={{ background: '#333', padding: '10px' }}>
              <h3>Вы уже зарегистрированы:</h3>
              <p>
                <b>Ник:</b> {userInfo.nickname}<br/>
                <b>Twitter:</b> {userInfo.twitter || '-'}<br/>
                <b>Баланс:</b> {userInfo.token_balance}
              </p>
            </div>
          ) : (
            <div style={{ background: '#333', padding: '10px' }}>
              <h3>Регистрация</h3>
              <label>Nickname:</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <br/>
              <label>Twitter (необязательно):</label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
              />
              <br/>
              <button onClick={handleRegister}>Сохранить</button>
            </div>
          )}

          <button onClick={disconnectPhantom} style={{ marginTop: '20px' }}>
            Отключить Phantom
          </button>

          <div style={{ marginTop: '20px' }}>
            <Link href="/leaderboard">
              <button>Лидерборд</button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
