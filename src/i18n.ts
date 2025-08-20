export type Lang = 'ru' | 'en';

export const texts: Record<Lang, {
  title: string;
  subtitle: string;
  pay: string;
  connect: string;
  amountPlaceholder: string;
  success: string;
  error: string;
}> = {
  ru: {
    title: 'LFG to AI',
    subtitle: 'Один клик к ИИ‑автоматизации. Оплата в TON.',
    pay: 'Оплатить',
    connect: 'Подключить кошелёк',
    amountPlaceholder: 'Сумма в TON (например, 10)',
    success: 'Транзакция отправлена в сеть TON',
    error: 'Не удалось отправить транзакцию'
  },
  en: {
    title: 'LFG to AI',
    subtitle: 'One click to AI automation. Pay with TON.',
    pay: 'Pay',
    connect: 'Connect wallet',
    amountPlaceholder: 'Amount in TON (e.g., 10)',
    success: 'Transaction submitted to TON',
    error: 'Failed to send transaction'
  }
};


