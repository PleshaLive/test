// pages/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';            // <--- Добавляем импорт Link!
import { Connection, PublicKey } from '@solana/web3.js';

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [message, setMessage] = useState('');

  // Mint вашего токена
  const TOKEN_MINT = "3EnxSbUszY4XPDfmWRJa3jkBUX4Dn8rdh4ZkNQCwpump";

  // Подставляем ваш Ankr-URL (Mainnet), чтобы считывать баланс:
  const SOLANA_RPC_ENDPOINT = "https://rpc.ankr.com/solana/3226dc3c471ff22f8355da4308ddd4a219b5ad67a62557acde28a539b94a550e";
  // Если у вас токен в Devnet — нужно использовать "https://rpc.ankr.com/solana_devnet/...",
  // и не забыть переключить Phantom в Devnet.

  // Проверяем наличие Phantom
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('solana' in window) {
        if (window.solana.isPhantom) {
          setMessage('Phantom найден! Нажмите «Подключить Phantom»');
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
    try {
      const resp = await window.solana.connect();
      setWalletConnected(true);
      const pubKeyString = resp.publicKey.toString();
      setPublicKey(pubKeyString);
      setMessage('Кошелёк подключён!');

      // Получаем баланс токена:
      const balance = await getTokenBalance(resp.publicKey);
      setTokenBalance(balance);

      // Отправляем (регистрируем/обновляем) пользователя на бэкенд
      await registerUser(pubKeyString, balance);

    } catch (error) {
      console.error(error);
      setMessage('Ошибка при подключении кошелька');
    }
  };

  // Получаем баланс нужного токена
  const getTokenBalance = async (userPublicKey) => {
    try {
      const connection = new Connection(SOLANA_RPC_ENDPOINT);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        userPublicKey,
        {
          programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
        }
      );

      // Ищем среди токен-аккаунтов тот, у которого mint == TOKEN_MINT
      const accountInfo = tokenAccounts.value.find(
        (account) => account.account.data.parsed.info.mint === TOKEN_MINT
      );

      if (!accountInfo) {
        return 0; // У пользователя нет этого токена
      }

      const amount = accountInfo.account.data.parsed.info.tokenAmount.uiAmount;
      return amount || 0;
    } catch (err) {
      console.error('Ошибка при получении баланса токена:', err);
      return 0;
    }
  };

  // Регистрируем пользователя (POST-запрос на /api/register)
  const registerUser = async (pubKeyString, balance) => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: pubKeyString, tokenBalance: balance }),
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
            {/* Используем <Link> вместо <a> */}
            <Link href="/leaderboard">
              Перейти на страницу Лидерборда
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
