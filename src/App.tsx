import { useEffect, useMemo, useState } from 'react';
import { texts, Lang } from './i18n';
import Index from './pages/Index';

export default function App() {
  const [lang, setLang] = useState<Lang>('ru');

  useEffect(() => {
    document.title = 'LFG to AI — TON Mini App';
  }, []);

  return (
    <Index lang={lang} onLangChange={setLang} />
  );
}


