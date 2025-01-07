// pages/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Connection, PublicKey } from '@solana/web3.js';

export default function Home() {
  // --------------------------
  // Состояния
  // --------------------------
  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [message, setMessage] = useState('');

  // Поля, которые пользователь вводит только после подключения
  const [nickname, setNickname] = useState('');
  const [twitter, setTwitter] = useState('');

  // Mint вашего токена (пример из предыдущих сообщений)
  const TOKEN_MINT = "3EnxSbUszY4XPDfmWRJa3jkBUX4Dn8rdh4ZkNQCwpump";
  // RPC (Mainnet или Devnet, смотря где ваш токен)
  const SOLANA_RPC_ENDPOINT = "https://rpc.ankr.com/solana/3226dc3c471ff22f8355da4308ddd4a219b5ad67a62557acde28a539b94a550e";
  // Или, например: "https://rpc.ankr.com/solana/..."
  // --------------------------------------------------

  // При загрузке проверяем наличие Phantom
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('solana' in window && window.solana.isPhantom) {
        setMessage('Phantom обнаружен, подключите кошелёк!');
      } else {
        setMessage('Установите Phantom-кошелёк, чтобы продолжить');
      }
    }
  }, []);

  // --------------------------
  // Функции
  // --------------------------

  const connectPhantom = async () => {
    try {
      const resp = await window.solana.connect();
      setWalletConnected(true);
      const pubKey = resp.publicKey.toString();
      setPublicKey(pubKey);
      setMessage(`Кошелёк подключён: ${pubKey}`);

      // Читаем баланс
      const balance = await getTokenBalance(resp.publicKey);
      setTokenBalance(balance);
    } catch (error) {
      console.error(error);
      setMessage('Ошибка при подключении Phantom');
    }
  };

  // Отключаем кошелёк (локально, сброс состояний)
  const disconnectPhantom = () => {
    setWalletConnected(false);
    setPublicKey(null);
    setTokenBalance(0);
    setNickname('');
    setTwitter('');
    setMessage('Кошелёк отключён (локально)');
  };

  // Получаем баланс
  const getTokenBalance = async (pubKeyObj) => {
    try {
      const connection = new Connection(SOLANA_RPC_ENDPOINT);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        pubKeyObj,
        { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
      );

      // Ищем аккаунт с нужным MINT
      const accountInfo = tokenAccounts.value.find(
        (acc) => acc.account.data.parsed.info.mint === TOKEN_MINT
      );
      if (!accountInfo) return 0;

      const amount = accountInfo.account.data.parsed.info.tokenAmount.uiAmount;
      return amount || 0;
    } catch (err) {
      console.error(err);
      return 0;
    }
  };

  // Регистрируем / Обновляем юзера
  const handleRegister = async () => {
    if (!publicKey) {
      setMessage('Сначала подключите кошелёк');
      return;
    }
    if (!nickname) {
      setMessage('Введите никнейм');
      return;
    }
    // twitter может быть пустым, это ок
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey,
          nickname,
          twitter,          // может быть ""
          tokenBalance
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Регистрация (обновление) успешна!');
      } else {
        setMessage('Ошибка при регистрации: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      setMessage('Ошибка при регистрации пользователя');
    }
  };

  // --------------------------
  // Стили (примерно, как на скриншоте)
  // --------------------------
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1c1f3f, #3e2d4a)',
    color: '#fff',
    fontFamily: 'Trebuchet MS, sans-serif',
    padding: 0,
    margin: 0,
    overflowX: 'hidden'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '20px 40px'
  };

  const menuStyle = {
    display: 'flex',
    gap: '20px'
  };

  const menuButtonStyle = {
    border: 'none',
    background: '#ffdf2d', // Желтоватая кнопка
    padding: '10px 20px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: 'bold'
  };

  const bigTitleStyle = {
    fontSize: '4rem',
    margin: '40px 0 10px 0',
    textAlign: 'center'
  };

  const subTitleStyle = {
    fontSize: '2.5rem',
    textAlign: 'center'
  };

  const contentStyle = {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: '30px',
    flexWrap: 'wrap'
  };

  const leftSideStyle = {
    maxWidth: '500px',
    margin: '20px'
  };

  const catTextStyle = {
    fontSize: '1rem',
    lineHeight: '1.5',
    marginTop: '20px'
  };

  const buyButtonStyle = {
    ...menuButtonStyle,
    background: '#ffb73d',
    marginTop: '20px'
  };

  const connectButtonStyle = {
    ...menuButtonStyle,
    background: '#74cba1',
    marginTop: '20px'
  };

  const formStyle = {
    marginTop: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    border: 'none'
  };

  const astronautStyle = {
    maxWidth: '400px',
    margin: '20px'
  };

  const footerStyle = {
    textAlign: 'center',
    marginTop: '40px',
    paddingBottom: '40px'
  };

  return (
    <div style={containerStyle}>
      {/* Шапка */}
      <header style={headerStyle}>
        <div style={menuStyle}>
          <button style={menuButtonStyle}>ROADMAP</button>
          <button style={menuButtonStyle}>ABOUT</button>
          <button style={menuButtonStyle}>CONTACT</button>
        </div>
        {/* "Art Show" кнопка и/или другой элемент */}
        <button style={menuButtonStyle}>ART SHOW</button>
      </header>

      {/* Главный блок */}
      <div>
        <h1 style={bigTitleStyle}>CAT MOON MEOW</h1>
        <h2 style={subTitleStyle}>MEOW in Space</h2>
      </div>

      {/* Контент */}
      <div style={contentStyle}>
        <div style={leftSideStyle}>
          <p style={catTextStyle}>
            MEOW strives to survive in a world full of chaos and disorder. 
            He finds his home on the moon, and this story follows his journey 
            to different planets, highlighting his ups and downs.<br /><br />
            Join the community and help MEOW navigate this universe. 
            Together, we will succeed with him!
          </p>

          {/* Кнопка "Buy" — просто декоративная */}
          <button style={buyButtonStyle}>BUY</button>

          {/* Сообщение/статус */}
          <p style={{ marginTop: '20px', color: '#ffdf2d' }}>{message}</p>

          {/* Если кошелёк НЕ подключён — кнопка подключить */}
          {!walletConnected && (
            <button style={connectButtonStyle} onClick={connectPhantom}>
              Подключить Phantom
            </button>
          )}

          {/* Если кошелёк подключён — показ формы (ник + твиттер + кнопка сохранить) */}
          {walletConnected && (
            <>
              <div style={formStyle}>
                <label>Nickname (обязательно):</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Введите никнейм"
                />
                <label>Twitter (необязательно):</label>
                <input
                  style={inputStyle}
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@mytwitter"
                />
                <button style={connectButtonStyle} onClick={handleRegister}>
                  Сохранить
                </button>
              </div>

              {/* Инфа о кошельке и баланс */}
              <div style={{ marginTop: '20px' }}>
                <p><b>Public Key:</b> {publicKey}</p>
                <p><b>Token Balance:</b> {tokenBalance}</p>
                <button
                  style={{ ...menuButtonStyle, background: '#f56e6e' }}
                  onClick={disconnectPhantom}
                >
                  Отключить кошелёк
                </button>
              </div>

              {/* Ссылка на Лидерборд */}
              <div style={{ marginTop: '20px' }}>
                <Link href="/leaderboard">
                  <button style={{ ...menuButtonStyle, background: '#666' }}>
                    Перейти в Лидерборд
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Изображение кота */}
        <div>
          {/* Пример: вы можете положить картинку cat-astronaut.png в public/ и затем */}
          {/* <img src="/cat-astronaut.png" style={astronautStyle} alt="Cat Astronaut" /> */}
          {/* или использовать публичный URL */}
          <img
            src="https://i.ibb.co/rF3tKMB/cat-astronaut.png"
            style={astronautStyle}
            alt="Cat Astronaut"
          />
        </div>
      </div>

      {/* "Футер" или пустая подложка */}
      <div style={footerStyle}>
        <p>© 2025 Cat Moon Meow</p>
      </div>
    </div>
  );
}
