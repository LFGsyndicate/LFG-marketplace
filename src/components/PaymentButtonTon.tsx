import { useState, useCallback } from 'react';
import { TonConnectButton, useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
// Ensure Buffer exists before loading @ton/core (dynamic import used below)
import { Buffer } from 'buffer';
(window as any).Buffer = (window as any).Buffer || Buffer;
import { texts } from '../i18n';
import { toast } from '@/components/ui/sonner';

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
    // Dynamic import avoids Buffer init race
    const { beginCell } = await import('@ton/core');
    const cell = beginCell().storeUint(0, 32).storeStringTail(text).endCell();
    return bytesToBase64(cell.toBoc());
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

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <TonConnectButton className="scale-90" />
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
  );
}