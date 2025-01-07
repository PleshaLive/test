// pages/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Connection, PublicKey } from '@solana/web3.js';

export default function Home() {
  // Состояние
  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [message, setMessage] = useState('');
  const [nickname, setNickname] = useState(''); // <-- никнейм

  // Mint вашего токена
  const TOKEN_MINT = "3EnxSbUszY4XPDfmWRJa3jkBUX4Dn8rdh4ZkNQCwpump";

  // Ваш RPC-эндпоинт (если токен на mainnet)
  const SOLANA_RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
  // Или, например, Ankr: "https://rpc.ankr.com/solana/..."
  // Или Devnet: "https://api.devnet.solana.com"

  // При загрузке проверяем наличие Phantom
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('solana' in window) {
        if (window.solana.isPhantom) {
          setMessage('Phantom найден! Введите никнейм и нажмите «Подключить Phantom»');
        } else {
          setMessage('Phantom не обнаружен!');
        }
      } else {
        setMessage('Phantom не установлен!');
      }
    }
  }, []);

  // Подключаемся к Phantom
  const connectPhantom = async () => {
    if (!nickname) {
      setMessage('Введите никнейм прежде, чем подключать кошелёк!');
      return;
    }
    try {
      const resp = await window.solana.connect();
      setWalletConnected(true);
      const pubKeyString = resp.publicKey.toString();
      setPublicKey(pubKeyString);
      setMessage(`Кошелёк подключён! (${pubKeyString})`);

      // Получаем баланс нужного токена
      const balance = await getTokenBalance(resp.publicKey);
      setTokenBalance(balance);

      // Регистрируем пользователя (передаём nickname)
      await registerUser(pubKeyString, balance, nickname);
    } catch (error) {
      console.error(error);
      setMessage('Ошибка при подключении кошелька');
    }
  };

  // Отключаем кошелёк (локально, на фронтенде)
  const disconnectPhantom = async () => {
    // На данный момент Phantom не всегда имеет официальный "disconnect" метод,
    // но мы можем просто сбросить состояние.
    setWalletConnected(false);
    setPublicKey(null);
    setTokenBalance(null);
    setMessage('Кошелёк отключён!');
    setNickname('');
  };

  // Получаем баланс
  const getTokenBalance = async (userPubKey) => {
    try {
      const connection = new Connection(SOLANA_RPC_ENDPOINT);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        userPubKey,
        { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
      );

      const accountInfo = tokenAccounts.value.find(
        (acc) => acc.account.data.parsed.info.mint === TOKEN_MINT
      );
      if (!accountInfo) {
        return 0;
      }
      const amount = accountInfo.account.data.parsed.info.tokenAmount.uiAmount;
      return amount || 0;
    } catch (err) {
      console.error('Ошибка при получении баланса:', err);
      return 0;
    }
  };

  // Регистрируем/обновляем пользователя на сервере
  const registerUser = async (pubKeyString, balance, nickname) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: pubKeyString, tokenBalance: balance, nickname }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage('Ошибка при регистрации: ' + data.error);
      }
    } catch (error) {
      console.error('Ошибка при регистрации пользователя:', error);
      setMessage('Ошибка при регистрации пользователя');
    }
  };

  // Небольшие стили (inline)
  const containerStyle = {
    minHeight: '100vh',
    background: '#f0f0f0',
    fontFamily: 'Arial, sans-serif',
    padding: '30px'
  };

  const cardStyle = {
    maxWidth: '600px',
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

  const inputStyle = {
    padding: '8px',
    fontSize: '16px',
    marginRight: '10px'
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    background: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '10px'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Пример подключения Phantom</h1>
        <p>{message}</p>

        {!walletConnected ? (
          <div>
            <p>Введите ваш никнейм:</p>
            <input
              style={inputStyle}
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Ваш ник..."
            />
            <button style={buttonStyle} onClick={connectPhantom}>
              Подключить Phantom
            </button>
          </div>
        ) : (
          <div>
            <p><b>Ник:</b> {nickname}</p>
            <p><b>Public Key:</b> {publicKey}</p>
            <p><b>Баланс токена {TOKEN_MINT}:</b> {tokenBalance}</p>

            <button style={buttonStyle} onClick={disconnectPhantom}>
              Отключить кошелёк
            </button>

            <Link href="/leaderboard">
              <button style={{ ...buttonStyle, background: '#666' }}>
                Перейти к Лидерборду
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
