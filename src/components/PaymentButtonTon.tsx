import { useState, useCallback } from 'react';
import { useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
import { texts } from '../i18n';
import { toast } from '@/components/ui/sonner';

// Removed CustomTonConnectButton as per user request - TON Connect doesn't allow multiple instances

type Props = {
  amount?: number; // Сумма в TON, опционально
  lang: keyof typeof texts;
  comment?: string; // Заголовок услуги (локализованный)
};

const toNano = (tons: number): string => Math.round(tons * 1e9).toString();

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  // btoa is browser-safe base64
  return btoa(binary);
};

export function PaymentSection({ amount, lang, comment }: Props) {
  const [customAmount, setCustomAmount] = useState('');
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const userFriendlyAddress = useTonAddress(); // EQ...
  const t = texts[lang];



  const buildCommentPayload = async (title?: string, pkgId?: string): Promise<string | undefined> => {
    // Собираем комментарий: "[<pkgId>] <title> | buyer: <address>"
    const buyer = userFriendlyAddress || wallet?.account?.address;
    // FIX: Prevent double ID in comment by cleaning the title
    const cleanTitle = pkgId && title ? title.replace(`[${pkgId}]`, '').trim() : title;
    const titlePart = cleanTitle ? `${cleanTitle}` : '';
    const idPart = pkgId ? `[${pkgId}] ` : '';
    const buyerPart = buyer ? ` | buyer: ${buyer}` : '';
    const text = `${idPart}${titlePart}${buyerPart}`.trim();
    if (!text) return undefined;
    
    try {
      // Dynamic import to avoid Buffer conflicts
      const { beginCell } = await import('@ton/core');
      const cell = beginCell().storeUint(0, 32).storeStringTail(text).endCell();
      return bytesToBase64(cell.toBoc());
    } catch (error) {
      console.error('Error building comment payload:', error);
      return undefined;
    }
  };

  const executePayment = useCallback(async (paymentAmount: number, paymentComment?: string) => {
    try {
      // Показываем процесс подготовки
      toast("Подготовка транзакции...");

      // Пытаемся извлечь packageId из комментария, если передан формально как "[ID] ..."
      const maybeId = /\[([A-Z\-0-9]+)\]/i.exec(paymentComment || '')?.[1];
      const payload = await buildCommentPayload(paymentComment, maybeId);
      
      // PRODUCTION: All payments are sent to this wallet address.
      const productionRecipient = 'UQC1WXkJ_7t7sGu6ZTZ9BGoR6YAwtPoKoUf7KZtrgOQ3w7km'; // Production wallet address
      
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 минут
        messages: [
          {
            address: productionRecipient,
            amount: toNano(paymentAmount),
            ...(payload ? { payload } : {})
          }
        ]
      });
      
      toast("Платеж успешно отправлен!");
      
    } catch (e: any) {
      console.error('TON Payment Error:', e);
      
      // Улучшенная обработка ошибок
      if (e?.message?.includes('Operation aborted') || e?.message?.includes('cancelled')) {
        toast("Платёж отменён пользователем");
      } else if (e?.message?.includes('Insufficient funds')) {
        toast("Недостаточно средств на кошельке");
      } else if (e?.message?.includes('Network error') || e?.message?.includes('timeout')) {
        toast("Ошибка сети. Попробуйте ещё раз");
      } else if (e?.message?.includes('Invalid address')) {
        toast("Ошибка адреса получателя");
      } else {
        toast("Ошибка при отправке платежа. Попробуйте ещё раз");
      }
    }
  }, [tonConnectUI, userFriendlyAddress, wallet, buildCommentPayload]);



  const handlePay = async () => {
    const paymentAmount = amount ?? parseFloat(customAmount);
    if (!isFinite(paymentAmount) || paymentAmount <= 0) {
      toast(lang === 'ru' ? "Неверная сумма" : "Invalid amount");
      return;
    }

    // Проверяем подключение кошелька
    if (!wallet?.account) {
      toast(lang === 'ru' ? "Необходимо подключить кошелек, а потом оплачивать." : "You need to connect a wallet first, then pay.");
      return;
    }

    // Если кошелек уже подключен, выполняем платеж сразу
    await executePayment(paymentAmount, comment);
  };

  // Dynamic wallet status component
  const WalletStatus = () => {
    if (wallet?.account) {
      // Wallet is connected
      return (
        <div className="text-[10px] text-green-400 font-medium bg-green-400/10 px-1.5 py-0.5 rounded border border-green-400/20">
          ✓ {t.walletConnected}
        </div>
      );
    } else {
      // Wallet not connected - show link to header button
      return (
        <div className="text-[10px] bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
          <button
            onClick={() => {
              // Close any open modals first
              const closeButtons = document.querySelectorAll('[data-dialog-close]');
              closeButtons.forEach(btn => (btn as HTMLElement)?.click());
              
              // Scroll to header after a brief delay
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                // Highlight the header connect button
                const headerButton = document.querySelector('.tc-button, [data-tc-connect-button]');
                if (headerButton) {
                  (headerButton as HTMLElement).classList.add('wallet-highlight');
                  // Repeat animation 3 times
                  setTimeout(() => {
                    (headerButton as HTMLElement).classList.add('wallet-highlight');
                  }, 1000);
                  setTimeout(() => {
                    (headerButton as HTMLElement).classList.add('wallet-highlight');
                  }, 2000);
                  setTimeout(() => {
                    (headerButton as HTMLElement).classList.remove('wallet-highlight');
                  }, 3000);
                }
              }, 100);
            }}
            className="text-blue-400 hover:text-blue-300 underline transition-colors font-medium"
          >
            {t.needConnectWallet}
          </button>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Dynamic wallet status - displayed above payment button */}
      <WalletStatus />
      
      <div className="flex items-center gap-2 flex-wrap">
        {amount === undefined && (
          <input
            className="w-32 px-3 py-2 bg-transparent border border-white/30 rounded text-white placeholder:text-gray-300 text-sm focus:border-white/60 focus:outline-none backdrop-blur-sm"
            type="text"
            inputMode="decimal"
            placeholder={t.amountPlaceholder}
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
          />
        )}
        <button
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePay}
          disabled={!amount && (!parseFloat(customAmount) || parseFloat(customAmount) <= 0)}
        >
          {amount ? `${t.pay} ${amount} TON` : t.pay}
        </button>
      </div>
    </div>
  );
}