export interface Service {
  packageId: string;
  packageName: string;
  category: 'AI-сотрудники' | 'Маркетинг и Продажи' | 'Клиентский сервис' | 'Внутренние процессы' | 'Контент и Медиа' | 'Малый бизнес и Стартапы' | 'IT и Разработка' | 'Аналитика и Решения';
  targetAudience: string;
  coreProblemSolved: string;
  keyDeliverables: string;
  quantifiableBenefit: string;
  pricingTier1_Price: number;
  serviceType: 'Recurring' | 'One-Time';
  viralPotential: number;
  painPoint: string;
  persuasiveDescription: string;
  example: string;
  hasMonthlyCosts?: boolean;
  /** Пометка: цена была увеличена по правилу (<100k -> +50%) */
  pricingAdjusted?: boolean;
  /** Флаг для выделенных услуг с особенным стилингом */
  isFeatured?: boolean;
  /** Вариант выделения: primary - золотая рамка, secondary - синяя рамка */
  featuredVariant?: 'primary' | 'secondary';
  /** Цена в TON (конвертация из рублей по курсу 1 TON = 3000 RUB) */
  priceTON: number;
}

// Функция для конвертации цены в TON (1 TON ≈ 270 RUB)
const convertToTON = (priceRUB: number): number => {
  return Math.ceil((priceRUB / 270) * 100) / 100; // округление до сотых
};

// Импортируем полный список из основного проекта, если он доступен
// Фолбэк: локальный укороченный список
let sourceServices: any[] | null = null;
try {
  // Важно: путь относителен к папке TON_LFG — идём в родительский проект
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const texex = await import('../../src/data/services');
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  sourceServices = (texex.services as any[]) ?? null;
} catch {}

export const services: Service[] = (sourceServices
  ? sourceServices.map((s: any) => ({
      packageId: s.packageId,
      packageName: s.packageName,
      category: s.category,
      targetAudience: s.targetAudience,
      coreProblemSolved: s.coreProblemSolved,
      keyDeliverables: s.keyDeliverables,
      quantifiableBenefit: s.quantifiableBenefit,
      pricingTier1_Price: s.pricingTier1_Price,
      serviceType: s.serviceType,
      viralPotential: s.viralPotential,
      painPoint: s.painPoint,
      persuasiveDescription: s.persuasiveDescription,
      example: s.example,
      hasMonthlyCosts: s.hasMonthlyCosts,
      pricingAdjusted: s.pricingAdjusted,
      isFeatured: s.isFeatured,
      featuredVariant: s.featuredVariant,
      priceTON: convertToTON(Number(s.pricingTier1_Price || 0))
    }))
  : [
  // Категория AI-сотрудники (Премиум услуги)
  {
    packageId: 'EMP-01',
    packageName: 'Виртуальный AI-сотрудник',
    category: 'AI-сотрудники',
    targetAudience: 'Средний и крупный бизнес, руководители',
    coreProblemSolved: 'Комплексная автоматизация рабочих процессов',
    keyDeliverables: 'Персональный AI-ассистент: планирование встреч, анализ документов, подготовка отчетов, email-менеджмент, аналитика KPI.',
    quantifiableBenefit: 'Экономия 20-30 часов времени руководителя в неделю',
    pricingTier1_Price: 255000,
    priceTON: convertToTON(255000),
    serviceType: 'Recurring',
    viralPotential: 5,
    painPoint: 'Ваш рабочий день — это бесконечные мелкие задачи, которые не дают сосредоточиться на стратегии?',
    persuasiveDescription: 'Получите личного AI-ассистента класса "люкс", который работает как ваш заместитель. Он анализирует документы, готовит презентации, управляет календарем и предупреждает о важных метриках. Это как нанять топ-менеджера, но в 10 раз дешевле.',
    example: 'До: 10 часов в день на рутину. После: 2 часа на контроль, 8 часов на стратегическое развитие бизнеса.',
    hasMonthlyCosts: true,
    isFeatured: true,
    featuredVariant: 'primary',
  },
  {
    packageId: 'EMP-BC-01',
    packageName: 'AI-сотрудник для блокчейна/DAO/трейдинга',
    category: 'AI-сотрудники',
    targetAudience: 'Крипто-проекты, DAO, трейдеры, финтех',
    coreProblemSolved: 'Автоматизация крипто-операций и аналитики',
    keyDeliverables: 'AI для анализа рынков, автоматического трейдинга, управления DAO-процессами, мониторинга блокчейн-транзакций, риск-менеджмента.',
    quantifiableBenefit: 'Увеличение прибыльности торговых операций до 40%',
    pricingTier1_Price: 490000,
    priceTON: convertToTON(490000),
    serviceType: 'Recurring',
    viralPotential: 5,
    painPoint: 'Крипто-рынки не спят 24/7, а вы — человек? Упускаете прибыльные сделки из-за эмоций и усталости?',
    persuasiveDescription: 'Элитный AI-трейдер, который анализирует сотни индикаторов одновременно, не поддается FOMO и жадности. Торгует по четкой стратегии, управляет рисками и работает круглосуточно на всех биржах.',
    example: 'До: Ручной трейдинг с 60% прибыльных сделок. После: AI-система с 75%+ прибыльных сделок и строгим контролем рисков.',
    hasMonthlyCosts: true,
    isFeatured: true,
    featuredVariant: 'secondary',
  },
  {
    packageId: 'MKT-01',
    packageName: 'AI-Мастер Контента для SMM',
    category: 'Маркетинг и Продажи',
    targetAudience: 'SMM-агентства, ИП',
    coreProblemSolved: 'Автоматизация создания контента',
    keyDeliverables: 'Генерация контент-плана, текстов, изображений; автопостинг.',
    quantifiableBenefit: 'Экономия до 80% времени',
    pricingTier1_Price: 135000,
    priceTON: convertToTON(135000),
    pricingAdjusted: true,
    serviceType: 'One-Time',
    viralPotential: 4,
    painPoint: 'Выгораете, тратя часы на создание постов, которые не "выстреливают"?',
    persuasiveDescription: 'Представьте, что у вас есть неутомимый SMM-стажер, который работает 24/7, анализирует тренды и генерирует идеи. Наш AI — это именно он. Он не просто пишет тексты, он создает контент-стратегию, которая вовлекает.',
    example: 'До: 20 часов в неделю на SMM, охват 5000. После: 2 часа в неделю, охват 25000, потому что AI нашел виральный формат.',
    hasMonthlyCosts: true,
  },
  {
    packageId: 'SRV-01',
    packageName: 'AI-Чат-Бот для Первой Линии',
    category: 'Клиентский сервис',
    targetAudience: 'E-commerce, ритейл',
    coreProblemSolved: 'Снижение нагрузки на операторов',
    keyDeliverables: 'Интеграция чат-бота на сайт и в мессенджеры, обработка типовых запросов.',
    quantifiableBenefit: 'Значительное сокращение времени ответа',
    pricingTier1_Price: 270000,
    priceTON: convertToTON(270000),
    pricingAdjusted: true,
    serviceType: 'One-Time',
    viralPotential: 5,
    painPoint: 'Теряете клиентов ночью и в выходные, потому что менеджеры не на связи?',
    persuasiveDescription: 'Наймите идеального сотрудника поддержки, который работает 24/7 без перерывов. Наш AI-бот решает большинство вопросов клиентов на месте.',
    example: 'До: Клиент ждет ответа часы и уходит к конкуренту. После: Клиент получает ответ быстро, оформляет заказ и оставляет положительный отзыв.',
    hasMonthlyCosts: true,
  },
  {
    packageId: 'SMB-01',
    packageName: 'AI-Ассистент для Малого Бизнеса',
    category: 'Малый бизнес и Стартапы',
    targetAudience: 'ИП, салоны красоты',
    coreProblemSolved: 'Базовый набор для автоматизации',
    keyDeliverables: 'Простой чат-бот, генератор текстов и изображений, автоматизация email.',
    quantifiableBenefit: 'Быстрый старт в автоматизации без вложений',
    pricingTier1_Price: 120000,
    priceTON: convertToTON(120000),
    pricingAdjusted: true,
    serviceType: 'One-Time',
    viralPotential: 4,
    painPoint: 'Вы и жнец, и швец, и на дуде игрец? Рутина съедает все время, не оставляя сил на развитие?',
    persuasiveDescription: 'AI-ассистент берёт на себя ответы клиентам, посты в соцсети и рассылки, освобождая вас для развития бизнеса.',
    example: 'До: Владелец отвечает на сообщения до полуночи. После: AI отвечает 24/7, а владелец планирует стратегию.',
    hasMonthlyCosts: true,
  }
]);
