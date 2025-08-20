import { useState, useMemo, useCallback } from 'react';
import { motion, LazyMotion, domAnimation } from 'framer-motion';
import { services, Service } from '../data/services';
import { PaymentSection } from '../components/PaymentButtonTon';
import { texts, Lang } from '../i18n';

const RECIPIENT = 'UQC1WXkJ_7t7sGu6ZTZ9BGoR6YAwtPoKoUf7KZtrgOQ3w7km'; // lfgsyndicate.ton

const categories = [
  'Все',
  'AI-сотрудники',
  'Маркетинг и Продажи', 
  'Клиентский сервис',
  'Малый бизнес и Стартапы'
];

interface IndexProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

const Index = ({ lang, onLangChange }: IndexProps) => {
  const [filter, setFilter] = useState('Все');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const t = texts[lang];

  const filteredServices = useMemo(() => {
    return filter === 'Все' 
      ? services 
      : services.filter(service => service.category === filter);
  }, [filter]);

  const handleServiceSelect = useCallback((service: Service) => {
    setSelectedService(service);
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        {/* Header */}
        <header className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">LFG to AI</h1>
              <p className="text-blue-200">LFGsyndicate DAO</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button 
                  onClick={() => onLangChange('ru')}
                  className={`px-3 py-1 rounded ${lang === 'ru' ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  RU
                </button>
                <button 
                  onClick={() => onLangChange('en')}
                  className={`px-3 py-1 rounded ${lang === 'en' ? 'bg-blue-600' : 'bg-gray-700'}`}
                >
                  EN
                </button>
              </div>
              <PaymentSection recipient={RECIPIENT} lang={lang} />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              {lang === 'ru' ? 'AI-решения для бизнеса' : 'AI Solutions for Business'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-200 max-w-4xl mx-auto">
              {lang === 'ru' 
                ? '5+ готовых решений. Оплата в TON. Внедрение за 1-4 недели. Гарантированный результат.'
                : '5+ ready solutions. Pay with TON. Implementation in 1-4 weeks. Guaranteed results.'
              }
            </p>
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-blue-300">
                {lang === 'ru' ? 'Платежи поступают на:' : 'Payments go to:'}
              </p>
              <code className="bg-black/30 px-4 py-2 rounded text-xs break-all max-w-full">
                {RECIPIENT}
              </code>
            </div>
          </motion.div>
        </section>

        {/* Categories Filter */}
        <section className="container mx-auto px-6 py-8">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-6 py-3 rounded-full transition-all duration-200 ${
                  filter === category
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white/10 text-blue-200 hover:bg-white/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Services Grid */}
        <section className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <motion.div
                key={service.packageId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className={`
                  bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10
                  hover:bg-white/10 hover:border-white/20 transition-all duration-300
                  cursor-pointer
                  ${service.isFeatured ? (
                    service.featuredVariant === 'primary' 
                      ? 'ring-2 ring-yellow-400/50 shadow-xl shadow-yellow-400/20' 
                      : 'ring-2 ring-blue-400/50 shadow-xl shadow-blue-400/20'
                  ) : ''}
                `}
                onClick={() => handleServiceSelect(service)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{service.packageName}</h3>
                    <span className="text-sm text-blue-300 bg-blue-900/30 px-2 py-1 rounded">
                      {service.category}
                    </span>
                  </div>
                  {service.isFeatured && (
                    <span className={`
                      text-xs px-2 py-1 rounded
                      ${service.featuredVariant === 'primary' 
                        ? 'bg-yellow-400/20 text-yellow-300' 
                        : 'bg-blue-400/20 text-blue-300'
                      }
                    `}>
                      {lang === 'ru' ? 'ТОП' : 'TOP'}
                    </span>
                  )}
                </div>
                
                <p className="text-blue-200 mb-6 text-sm line-clamp-3">
                  {service.persuasiveDescription}
                </p>
                
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {service.priceTON} TON
                    </div>
                    <div className="text-xs text-blue-300">
                      ≈ {service.pricingTier1_Price.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                  <PaymentSection recipient={RECIPIENT} amount={service.priceTON} lang={lang} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Service Details Modal */}
        {selectedService && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedService.packageName}</h2>
                  <span className="text-blue-300 bg-blue-900/30 px-3 py-1 rounded">
                    {selectedService.category}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-blue-300">
                    {lang === 'ru' ? 'Проблема' : 'Problem'}
                  </h3>
                  <p className="text-gray-300">{selectedService.painPoint}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-blue-300">
                    {lang === 'ru' ? 'Решение' : 'Solution'}
                  </h3>
                  <p className="text-gray-300">{selectedService.persuasiveDescription}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-blue-300">
                    {lang === 'ru' ? 'Что входит' : 'What\'s included'}
                  </h3>
                  <p className="text-gray-300">{selectedService.keyDeliverables}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-blue-300">
                    {lang === 'ru' ? 'Результат' : 'Result'}
                  </h3>
                  <p className="text-gray-300">{selectedService.quantifiableBenefit}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2 text-blue-300">
                    {lang === 'ru' ? 'Пример' : 'Example'}
                  </h3>
                  <p className="text-gray-300">{selectedService.example}</p>
                </div>

                <div className="border-t border-gray-700 pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-3xl font-bold text-white">
                        {selectedService.priceTON} TON
                      </div>
                      <div className="text-sm text-gray-400">
                        ≈ {selectedService.pricingTier1_Price.toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                    <PaymentSection recipient={RECIPIENT} amount={selectedService.priceTON} lang={lang} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Footer */}
        <footer className="container mx-auto px-6 py-16 border-t border-white/10 mt-16">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">LFGsyndicate DAO</h3>
            <p className="text-blue-300">lfgsyndicate.ton</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-400">
                {lang === 'ru' ? 'Контакты:' : 'Contacts:'}
              </p>
              <p className="text-blue-300">Telegram — @lfgsyndicate</p>
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">
                  {lang === 'ru' ? 'TON Кошелек для платежей:' : 'TON Wallet for payments:'}
                </p>
                <code className="bg-black/30 px-3 py-1 rounded text-xs break-all">
                  {RECIPIENT}
                </code>
              </div>
            </div>
            <div className="pt-8 text-xs text-gray-500">
              <p>© LFGsyndicate DAO</p>
              <p className="mt-2">
                {lang === 'ru' 
                  ? 'Все платежи в TON. Безопасно. Децентрализованно. Прозрачно.'
                  : 'All payments in TON. Secure. Decentralized. Transparent.'
                }
              </p>
            </div>
          </div>
        </footer>
      </div>
    </LazyMotion>
  );
};

export default Index;

