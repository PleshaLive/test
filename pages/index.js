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

  // Флаг: уже зарегистрирован ли на бэкенде
  const [isRegistered, setIsRegistered] = useState(false);
  // Данные о зареганном (ник, твиттер, баланс), если есть
  const [userInfo, setUserInfo] = useState(null);

  // Параметры
  const TOKEN_MINT = "3EnxSbUszY4XPDfmWRJa3jkBUX4Dn8rdh4ZkNQCwpump";
  const SOLANA_RPC_ENDPOINT = "https://rpc.ankr.com/solana/3226dc3c471ff22f8355da4308ddd4a219b5ad67a62557acde28a539b94a550e";

  // При загрузке проверяем, есть ли Phantom
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('solana' in window && window.solana.isPhantom) {
        setMessage('Phantom найден. Подключите кошелёк!');
      } else {
        setMessage('Установите Phantom, чтобы продолжить');
      }
    }
  }, []);

  // Подключение к Phantom
  const connectPhantom = async () => {
    try {
      const resp = await window.solana.connect();
      setWalletConnected(true);
      const pubKey = resp.publicKey.toString();
      setPublicKey(pubKey);
      setMessage(`Phantom подключён: ${pubKey}`);

      // Узнаём баланс
      const bal = await getTokenBalance(resp.publicKey);
      setTokenBalance(bal);

      // Проверим на бэкенде, есть ли уже пользователь
      checkUser(pubKey);
    } catch (error) {
      console.error(error);
      setMessage('Ошибка при подключении Phantom');
    }
  };

  // Проверка, есть ли в базе user с таким publicKey
  const checkUser = async (pubKey) => {
    try {
      const res = await fetch(`/api/register?publicKey=${pubKey}`);
      if (!res.ok) {
        if (res.status === 404) {
          // Нет такого пользователя -> isRegistered=false
          setIsRegistered(false);
          setUserInfo(null);
        } else {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
      } else {
        // Нашли пользователя -> isRegistered=true
        const data = await res.json();
        setIsRegistered(true);
        setUserInfo(data);
      }
    } catch (err) {
      console.error('Ошибка checkUser:', err);
      setIsRegistered(false);
      setUserInfo(null);
    }
  };

  // Функция получить баланс
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
      const amount = accInfo.account.data.parsed.info.tokenAmount.uiAmount;
      return amount || 0;
    } catch (err) {
      console.error(err);
      return 0;
    }
  };

  // Сохранить (регистрация/обновление) на бэкенде
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
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey,
          nickname,
          twitter,
          tokenBalance
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage('Ошибка при регистрации: ' + data.error);
      } else {
        setMessage('Успешная регистрация/обновление!');
        // Теперь пользователь зарегистрирован
        setIsRegistered(true);
        // Обновим userInfo
        setUserInfo({
          publicKey,
          nickname,
          twitter,
          tokenBalance
        });
      }
    } catch (error) {
      console.error(error);
      setMessage('Ошибка при регистрации пользователя');
    }
  };

  // Отключение кошелька (локально)
  const disconnectPhantom = () => {
    setWalletConnected(false);
    setPublicKey(null);
    setTokenBalance(0);
    setMessage('Кошелёк отключён (локально)');
    setNickname('');
    setTwitter('');
    setIsRegistered(false);
    setUserInfo(null);
  };

  // ----- Пример простых стилей (упрощённо) -----
  const containerStyle = {
    minHeight: '100vh',
    background: '#1c1f3f',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
    padding: '40px'
  };
  const btnStyle = {
    display: 'inline-block',
    marginTop: '10px',
    padding: '10px 20px',
    background: '#74cba1',
    color: '#000',
    textDecoration: 'none',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer'
  };
  const inputStyle = {
    display: 'block',
    marginTop: '8px',
    marginBottom: '10px',
    padding: '8px',
    width: '300px'
  };

  return (
    <div style={containerStyle}>
      <h1>CAT MOON MEOW (Главная страница)</h1>
      <p style={{ color: '#ffdf2d' }}>{message}</p>

      {/* Если кошелёк не подключён — кнопка Подключить */}
      {!walletConnected && (
        <button style={btnStyle} onClick={connectPhantom}>
          Подключить Phantom
        </button>
      )}

      {/* Если кошелёк подключён */}
      {walletConnected && (
        <div>
          <p>
            <b>Public Key:</b> {publicKey}
          </p>
          <p>
            <b>Баланс токена:</b> {tokenBalance}
          </p>

          {/* Если уже зарегистрирован — показываем инфо */}
          {isRegistered && userInfo ? (
            <div style={{ marginTop: '20px', padding: '10px', background: '#333' }}>
              <h3>Вы уже зарегистрированы:</h3>
              <p>
                <b>Ник:</b> {userInfo.nickname}<br/>
                <b>Twitter:</b> {userInfo.twitter || '-'}<br/>
                <b>Баланс:</b> {userInfo.tokenBalance}
              </p>
            </div>
          ) : (
            // Если не зарегистрирован — показываем поля
            <div style={{ marginTop: '20px', padding: '10px', background: '#333' }}>
              <h3>Регистрация</h3>
              <label>Nickname (обязательно):</label>
              <input
                type="text"
                style={inputStyle}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              <label>Twitter (необязательно):</label>
              <input
                type="text"
                style={inputStyle}
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
              />
              <button style={btnStyle} onClick={handleRegister}>
                Сохранить
              </button>
            </div>
          )}

          {/* Кнопка Отключить кошелёк */}
          <button style={{ ...btnStyle, background: '#f56e6e' }} onClick={disconnectPhantom}>
            Отключить кошелёк
          </button>

          {/* Ссылка на Лидерборд */}
          <div style={{ marginTop: '20px' }}>
            <Link href="/leaderboard">
              <button style={{ ...btnStyle, background: '#666', color: '#fff' }}>
                Перейти в Лидерборд
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
