import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// Init Telegram theme
// @ts-ignore
const tg = (window as any).Telegram?.WebApp;
try {
  tg?.expand?.();
  tg?.enableClosingConfirmation?.();
} catch {}

createRoot(document.getElementById('root')!).render(
  <TonConnectUIProvider manifestUrl="https://lfg-ton-marketplace.vercel.app/tonconnect-manifest.json">
    <App />
  </TonConnectUIProvider>
);

