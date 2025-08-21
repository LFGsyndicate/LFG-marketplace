import { useState } from 'react';
import Index from './pages/Index';
import './styles.css';
import { Lang } from './i18n';
import { Toaster } from '@/components/ui/sonner';

function App() {
  const [lang, setLang] = useState<Lang>('ru');

  return (
    <>
      <Index lang={lang} onLangChange={setLang} />
      <Toaster richColors position="top-center" />
    </>
  );
}

export default App;

