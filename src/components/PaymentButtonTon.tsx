import { useState, useEffect, useCallback } from 'react';
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
  const [isPendingConnection, setIsPendingConnection] = useState(false);
  const [pendingPaymentData, setPendingPaymentData] = useState<{amount: number, comment?: string} | null>(null);
  const [modalOpenTime, setModalOpenTime] = useState<number | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const userFriendlyAddress = useTonAddress(); // EQ...
  const t = texts[lang];

  // Подписка на состояние модального окна по официальной документации
  useEffect(() => {
    if (!tonConnectUI) return;
    
    const unsubscribe = tonConnectUI.onModalStateChange((state) => {
      console.log('Modal state changed:', state);
      
      // Отслеживаем открытие модального окна
      if (state.status === 'opened' && isPendingConnection) {
        setModalOpenTime(Date.now());
        console.log('Modal opened for wallet connection');
      }
      
      // Если модальное окно закрылось и мы ожидали подключения
      if (state.status === 'closed' && isPendingConnection) {
        const closeTime = Date.now();
        const modalWasOpenFor = modalOpenTime ? closeTime - modalOpenTime : 0;
        
        console.log('Modal closed with reason:', state.closeReason, 'was open for:', modalWasOpenFor, 'ms');
        
        // Определяем тип закрытия модального окна более точно
        const isQuickClose = modalWasOpenFor < 1000; // Закрыли слишком быстро
        const isUserCancellation = state.closeReason === 'action-cancelled' || 
                                   (isQuickClose && !state.closeReason); // Быстрое закрытие без причины = отмена
        
        const isWalletSelection = state.closeReason === 'wallet-selected' || 
                                 (!isQuickClose && !state.closeReason); // Не быстрое закрытие без причины = выбор кошелька
        
        if (isUserCancellation) {
          // Пользователь явно отменил подключение (нажал X, ESC или быстро закрыл)
          console.log('User explicitly cancelled wallet connection');
          setIsPendingConnection(false);
          setPendingPaymentData(null);
          setModalOpenTime(null);
          setConnectionAttempts(0);
          toast("Подключение кошелька отменено");
        } else if (isWalletSelection) {
          // Кошелек выбран - переходим к подключению
          console.log('Wallet selected, transitioning to connection...');
          setConnectionAttempts(prev => prev + 1);
          toast("Открываем кошелек для подтверждения подключения...");
          // НЕ сбрасываем isPendingConnection - ждем подключения!
          
          // Если слишком много попыток - сбрасываем через некоторое время
          if (connectionAttempts >= 3) {
            console.log('Too many connection attempts, will reset soon');
            setTimeout(() => {
              if (isPendingConnection) {
                setIsPendingConnection(false);
                setPendingPaymentData(null);
                setModalOpenTime(null);
                setConnectionAttempts(0);
                toast("Превышено количество попыток подключения. Попробуйте еще раз.");
              }
            }, 10000); // 10 секунд
          }
        } else {
          // Неизвестная причина - логируем для отладки но продолжаем
          console.log('Unknown modal close reason, continuing connection process...');
          toast("Продолжаем подключение кошелька...");
        }
        
        setModalOpenTime(null);
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [tonConnectUI, isPendingConnection, modalOpenTime, connectionAttempts]);

  // Подписка на статус кошелька для лучшего отслеживания подключения
  useEffect(() => {
    if (!tonConnectUI) return;
    
    const unsubscribe = tonConnectUI.onStatusChange((walletInfo) => {
      console.log('Wallet status changed:', walletInfo);
      
      // Если кошелек подключился и мы ожидали подключения
      if (walletInfo && isPendingConnection) {
        console.log('Wallet connected via status change:', walletInfo);
        toast("Кошелек успешно подключен!");
        // Позволяем useEffect обработать это через wallet?.account
      } else if (!walletInfo && isPendingConnection) {
        // Кошелек отключился во время ожидания
        console.log('Wallet disconnected during pending connection');
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [tonConnectUI, isPendingConnection]);

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

  // Effect to handle wallet connection completion
  useEffect(() => {
    if (wallet?.account && isPendingConnection && pendingPaymentData) {
      // Wallet just connected and we have pending payment data
      console.log('Wallet connected successfully, proceeding with payment:', {
        walletAddress: wallet.account.address,
        pendingAmount: pendingPaymentData.amount
      });
      
      setIsPendingConnection(false);
      setModalOpenTime(null);
      setConnectionAttempts(0);
      const { amount: pendingAmount, comment: pendingComment } = pendingPaymentData;
      setPendingPaymentData(null);
      
      // Показываем успешное подключение
      toast("Кошелек успешно подключен! Продолжаем оплату...");
      
      // Небольшая задержка для полной инициализации кошелька
      setTimeout(() => {
        executePayment(pendingAmount, pendingComment);
      }, 1000);
    }
  }, [wallet?.account, isPendingConnection, pendingPaymentData, executePayment]);

  // Таймаут для сброса состояния ожидания подключения
  useEffect(() => {
    if (!isPendingConnection) return;
    
    const timeout = setTimeout(() => {
      if (isPendingConnection) {
        console.log('Connection timeout, resetting state');
        setIsPendingConnection(false);
        setPendingPaymentData(null);
        setModalOpenTime(null);
        setConnectionAttempts(0);
        toast("Время ожидания подключения истекло. Попробуйте ещё раз.");
      }
    }, 60000); // 60 секунд таймаут
    
    return () => {
      clearTimeout(timeout);
    };
  }, [isPendingConnection]);

  const handlePay = async () => {
    const paymentAmount = amount ?? parseFloat(customAmount);
    if (!isFinite(paymentAmount) || paymentAmount <= 0) {
      toast("Неверная сумма");
      return;
    }

    // Проверяем подключение кошелька
    if (!wallet?.account) {
      // Проверяем что TON Connect UI инициализирован
      if (!tonConnectUI || typeof tonConnectUI.openModal !== 'function') {
        toast("Ошибка инициализации TON Connect. Перезагрузите страницу.");
        return;
      }
      
      // Сохраняем данные платежа для выполнения после подключения
      setPendingPaymentData({ amount: paymentAmount, comment });
      setIsPendingConnection(true);
      
      toast("Подключение кошелька...");
      
      try {
        // Проверяем состояние модального окна по официальной документации
        const currentModalState = tonConnectUI.modalState;
        
        // Если модальное окно уже открыто, закрываем его сначала
        if (currentModalState?.status === 'opened') {
          console.log('Modal is already open, closing first...');
          tonConnectUI.closeModal();
          // Ждем пока модальное окно закроется
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Открываем модальное окно согласно официальной документации
        console.log('Opening TON Connect modal...');
        await tonConnectUI.openModal();
        console.log('Modal opened successfully');
        
      } catch (e: any) {
        console.error('Error opening wallet modal:', e);
        setIsPendingConnection(false);
        setPendingPaymentData(null);
        
        // Показываем ошибку с рекомендациями
        if (e?.message?.includes('TonConnectUIError') || e?.message?.includes('TonConnectError')) {
          toast("Ошибка TON Connect. Попробуйте кнопку 'Connect Wallet' в заголовке.");
        } else {
          toast("Не удалось открыть модальное окно кошелька. Используйте кнопку 'Connect Wallet' в заголовке.");
        }
      }
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
        disabled={(!amount && (!parseFloat(customAmount) || parseFloat(customAmount) <= 0)) || isPendingConnection}
      >
        {isPendingConnection 
          ? (lang === 'ru' ? 'Ожидание подключения...' : 'Waiting for connection...') 
          : (amount ? `${t.pay} ${amount} TON` : t.pay)
        }
      </button>
    </div>
  );
}