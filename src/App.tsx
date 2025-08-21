import { useState } from 'react';
import Index from './pages/Index';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import './styles.css';
import { Lang } from './i18n';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [lang, setLang] = useState<Lang>('ru');

  return (
    <TonConnectUIProvider manifestUrl="https://lfg-syndicate.github.io/ton-dapp-vite/tonconnect-manifest.json">
      <Index lang={lang} onLangChange={setLang} />
      <Toaster richColors position="top-center" />
    </TonConnectUIProvider>
  );
}

export default App;

