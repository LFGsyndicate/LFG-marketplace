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

// Use static manifest for production
const manifestUrl = window.location.origin + '/tonconnect-manifest.json';

createRoot(document.getElementById('root')!).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>
);

