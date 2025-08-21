import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';

// Proper Buffer polyfill - avoid race conditions
if (typeof window !== 'undefined' && !window.Buffer) {
  import('buffer').then(({ Buffer }) => {
    window.Buffer = Buffer;
  });
}

// Init Telegram theme
const tg = (window as any).Telegram?.WebApp;
try {
  tg?.expand?.();
  tg?.enableClosingConfirmation?.();
} catch {}

// Dynamic manifest URL - works both locally and in production
const manifestUrl = window.location.origin + '/api/manifest';

createRoot(document.getElementById('root')!).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>
);

