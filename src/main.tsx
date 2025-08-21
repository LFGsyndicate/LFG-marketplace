import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
// Polyfill Buffer for @ton/core browser bundle
import { Buffer } from 'buffer';
(window as any).Buffer = Buffer;

// Init Telegram theme
// @ts-ignore
const tg = (window as any).Telegram?.WebApp;
try {
  tg?.expand?.();
  tg?.enableClosingConfirmation?.();
} catch {}

const manifestUrl = import.meta.env.DEV
  ? 'https://lfg-ton-marketplace.vercel.app/tonconnect-manifest.json'
  : `${window.location.origin}/tonconnect-manifest.json`;

createRoot(document.getElementById('root')!).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>
);

