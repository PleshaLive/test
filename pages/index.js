// pages/index.js
import { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [message, setMessage] = useState('');

  // Mint вашего токена
  const TOKEN_MINT = "3EnxSbUszY4XPDfmWRJa3jkBUX4Dn8rdh4ZkNQCwpump";

  // Адрес RPC, можно взять любой публичный, например, солановский mainnet-beta
  const SOLANA_RPC_ENDPOINT = "https://rpc.ankr.com/solana/3226dc3c471ff22f8355da4308ddd4a219b5ad67a62557acde28a539b94a550e";
  // Или devnet: "https://api.devnet.solana.com"
  // Зависит от того, где находится ваш токен.

  // Функция для проверки, есть ли у пользователя Phantom
  useEffect(() => {
    if ('solana' in window) {
      if (window.solana.isPhantom) {
        setMessage('Phantom найден! Нажмите «Подключить Phantom»');
      } else {
        setMessage('Phantom не обнаружен!');
      }
    } else {
      setMessage('Phantom не установлен!');
    }
  }, []);

  // Функция — подключаемся к Phantom
  const connectPhantom = async () => {
    try {
      const resp = await window.solana.connect();
      setWalletConnected(true);
      setPublicKey(resp.publicKey.toString());
      setMessage('Кошелёк подключён!');

      // Теперь получаем баланс токена:
      const balance = await getTokenBalance(resp.publicKey);
      setTokenBalance(balance);

      // Отправляем (регестрируем/обновляем) пользователя на бэкенд
      await registerUser(resp.publicKey.toString(), balance);

    } catch (error) {
      console.error(error);
      setMessage('Ошибка при подключении кошелька');
    }
  };

  // Функция — получить баланс нужного токена
  const getTokenBalance = async (userPublicKey) => {
    try {
      const connection = new Connection(SOLANA_RPC_ENDPOINT);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        userPublicKey,
        { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
      );

      // Ищем среди токен-аккаунтов тот, у которого mint == нужному
      const accountInfo = tokenAccounts.value.find(
        (account) => account.account.data.parsed.info.mint === TOKEN_MINT
      );

      if (!accountInfo) {
        return 0; // у пользователя нет этого токена
      }

      const amount = accountInfo.account.data.parsed.info.tokenAmount.uiAmount;
      return amount || 0;
    } catch (err) {
      console.error('Ошибка при получении баланса токена:', err);
      return 0;
    }
  };

  // Функция — вызываем наш API /api/register
  const registerUser = async (publicKey, balance) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey, tokenBalance: balance }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Пользователь зарегистрирован/обновлён!');
      } else {
        setMessage('Ошибка при регистрации: ' + data.error);
      }
    } catch (error) {
      console.error('Ошибка при регистрации пользователя:', error);
      setMessage('Ошибка при регистрации пользователя');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Пример подключения Phantom</h1>
      <p>{message}</p>

      {!walletConnected ? (
        <button onClick={connectPhantom}>
          Подключить Phantom
        </button>
      ) : (
        <>
          <p>Ваш Public Key: {publicKey}</p>
          <p>Баланс токена {TOKEN_MINT}: {tokenBalance}</p>
          <p>
            <a href="/leaderboard">
              Перейти на страницу Лидерборда
            </a>
          </p>
        </>
      )}
    </div>
  );
}
