import { useState } from 'react';
import { TonConnectButton, useTonConnectUI, useTonWallet, useTonAddress } from '@tonconnect/ui-react';
// Ensure Buffer exists before loading @ton/core (dynamic import used below)
import { Buffer } from 'buffer';
(window as any).Buffer = (window as any).Buffer || Buffer;
import { texts } from '../i18n';
import { toast } from '@/components/ui/sonner';

type Props = {
  recipient: string;
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

export function PaymentSection({ recipient, amount, lang, comment }: Props) {
  const [customAmount, setCustomAmount] = useState('');
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const userFriendlyAddress = useTonAddress(); // EQ...
  const t = texts[lang];

  const buildCommentPayload = async (title?: string, pkgId?: string): Promise<string | undefined> => {
    // Собираем комментарий: "[<pkgId>] <title> | buyer: <address>"
    const buyer = userFriendlyAddress || wallet?.account?.address;
    const titlePart = title ? `${title}` : '';
    const idPart = pkgId ? `[${pkgId}] ` : '';
    const buyerPart = buyer ? ` | buyer: ${buyer}` : '';
    const text = `${idPart}${titlePart}${buyerPart}`.trim();
    if (!text) return undefined;
    // Dynamic import avoids Buffer init race
    const { beginCell } = await import('@ton/core');
    const cell = beginCell().storeUint(0, 32).storeStringTail(text).endCell();
    return bytesToBase64(cell.toBoc());
  };

    const handlePay = async () => {
    console.log('handlePay called');
    console.log('Wallet object:', wallet);
    console.log('Is wallet connected?', !!wallet?.account);
    const paymentAmount = amount ?? parseFloat(customAmount);
    if (!isFinite(paymentAmount) || paymentAmount <= 0) return;

    try {
      // Требуем подключение кошелька перед оплатой
      if (!wallet?.account) {
        toast("Ожидание подключения кошелька");
        await tonConnectUI.openModal();
        return; // пользователь подключит кошелек и нажмет снова
      }

      // Пытаемся извлечь packageId из комментария, если передан формально как "[ID] ..."
      const maybeId = /\[([A-Z\-0-9]+)\]/i.exec(comment || '')?.[1];
      const payload = await buildCommentPayload(comment, maybeId);
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 минут
        messages: [
          {
            address: recipient,
            amount: toNano(paymentAmount),
            ...(payload ? { payload } : {})
          }
        ]
      });
      alert(t.success);
    } catch (e: any) {
      // Игнорируем отмену операции пользователем
      if (typeof e?.message === 'string' && e.message.includes('Operation aborted')) {
        toast("Платёж отменён");
        return;
      }
      console.error('TON Payment Error:', e);
      toast("Ошибка оплаты");
    }
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

