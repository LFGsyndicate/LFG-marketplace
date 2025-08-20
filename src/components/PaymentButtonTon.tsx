import { useState } from 'react';
import { TonConnectButton, useTonConnectUI } from '@tonconnect/ui-react';
import { texts } from '../i18n';

type Props = {
  recipient: string;
  amount?: number; // Сумма в TON, опционально
  lang: keyof typeof texts;
};

const toNano = (tons: number): string => Math.round(tons * 1e9).toString();

export function PaymentSection({ recipient, amount, lang }: Props) {
  const [customAmount, setCustomAmount] = useState('');
  const [tonConnectUI] = useTonConnectUI();
  const t = texts[lang];

  const handlePay = async () => {
    const paymentAmount = amount ?? parseFloat(customAmount);
    if (!isFinite(paymentAmount) || paymentAmount <= 0) return;

    try {
      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600, // 10 минут
        messages: [
          {
            address: recipient,
            amount: toNano(paymentAmount)
          }
        ]
      });
      alert(t.success);
    } catch (e) {
      console.error('TON Payment Error:', e);
      alert(t.error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <TonConnectButton />
      {amount === undefined && (
        <input
          className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white placeholder:text-gray-400 text-sm"
          type="text"
          inputMode="decimal"
          placeholder={t.amountPlaceholder}
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
        />
      )}
      <button
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handlePay}
        disabled={!amount && (!parseFloat(customAmount) || parseFloat(customAmount) <= 0)}
      >
        {amount ? `${t.pay} ${amount} TON` : t.pay}
      </button>
    </div>
  );
}

