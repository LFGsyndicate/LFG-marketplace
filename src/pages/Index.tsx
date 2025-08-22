import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { services, Service } from '@/data/services';
import overridesRaw from '@/data/services_en_overrides.json';
import type { ServiceEnOverrides } from '@/data/services_en_overrides';
import { motion, LazyMotion, domAnimation } from 'framer-motion';
import './liquid-glass.css';
import { Separator } from '@/components/ui/separator';
import { PaymentSection } from '@/components/PaymentButtonTon';
import { texts, Lang } from '@/i18n';
import { TonConnectButton } from '@tonconnect/ui-react';

const RECIPIENT = 'lfgsyndicate.ton';

const heroSlides: { intro?: boolean; category?: string; title: Record<Lang, string>; subtitle: Record<Lang, string> }[] = [
  { 
    intro: true, 
    title: { ru: 'Готовые AI-решения с гарантированным ROI', en: 'Ready AI Solutions with Guaranteed ROI' }, 
    subtitle: { ru: '54+ проверенных решений. Внедрение за 1-4 недели. Фиксированная цена. Гарантированный результат.', en: '54+ proven solutions. Implementation in 1-4 weeks. Fixed price. Guaranteed results.' } 
  },
  { 
    category: "Маркетинг и Продажи", 
    title: { ru: "Маркетинг, который окупается в 3-5 раз", en: "Marketing with a 3-5x ROI" }, 
    subtitle: { ru: "AI находит ваших клиентов, создает контент-магниты и оптимизирует рекламу в реальном времени.", en: "AI finds your clients, creates content magnets, and optimizes ads in real-time." } 
  },
  {
    category: "AI-сотрудники",
    title: { ru: "Виртуальные AI-ассистенты 24/7", en: "24/7 Virtual AI Assistants" },
    subtitle: { ru: "Персональные помощники для руководителей и команд. Автоматизация рутины и повышение эффективности.", en: "Personal assistants for managers and teams. Routine automation and efficiency boost." }
  },
  {
    category: "Клиентский сервис",
    title: { ru: "AI для отличного сервиса клиентов", en: "AI for Excellent Customer Service" },
    subtitle: { ru: "Умные чат-боты, автоматизация поддержки и мгновенные ответы на запросы клиентов.", en: "Smart chatbots, support automation, and instant responses to customer inquiries." }
  },
  {
    category: "Аналитика и Решения",
    title: { ru: "AI-аналитика для принятия решений", en: "AI Analytics for Decision Making" },
    subtitle: { ru: "Прогнозы, insights и рекомендации на основе больших данных для роста вашего бизнеса.", en: "Forecasts, insights and recommendations based on big data for business growth." }
  },
  {
    category: "IT и Разработка",
    title: { ru: "AI в разработке и DevOps", en: "AI in Development and DevOps" },
    subtitle: { ru: "Автоматизация кодинга, тестирования, развертывания и мониторинга приложений.", en: "Coding automation, testing, deployment and application monitoring." }
  },
  {
    category: "Контент и Медиа",
    title: { ru: "AI для создания контента", en: "AI for Content Creation" },
    subtitle: { ru: "Генерация текстов, видео, аудио и мультимедиа контента для маркетинга и развлечений.", en: "Text, video, audio and multimedia content generation for marketing and entertainment." }
  }
];

const Index = ({ lang, onLangChange }: { lang: Lang, onLangChange: (lang: Lang) => void }) => {
  const [filter, setFilter] = useState('Все');
  const overrides = overridesRaw as ServiceEnOverrides;
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showServicesList, setShowServicesList] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const t = texts[lang];

  // Helper to get localized field from service data
  const getText = useCallback((s: any, key: string) => {
    if (lang === 'en') {
      const enKey = `${key}En`;
      const byField = s && typeof s === 'object' && enKey in s && s[enKey] ? s[enKey] : null;
      const byOverride = s?.packageId && overrides?.[s.packageId]?.[key as keyof typeof overrides[string]];
      return byField || byOverride || s?.[key];
    }
    return s?.[key];
  }, [lang, overrides]);

  // Emit structured data for services (basic SEO for LLMs and search)
  useEffect(() => {
    try {
      const list = services.slice(0, 30).map(s => ({
        '@type': 'Product',
        'name': s.packageName,
        'sku': s.packageId,
        'category': s.category,
        'description': s.persuasiveDescription,
        'offers': {
          '@type': 'Offer',
          'priceCurrency': 'TON',
          'price': s.priceTON
        }
      }));
      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'itemListElement': list
      };
      let el = document.getElementById('schema-services');
      if (!el) {
        el = document.createElement('script');
        (el as HTMLScriptElement).type = 'application/ld+json';
        el.id = 'schema-services';
        document.head.appendChild(el);
      }
      el.textContent = JSON.stringify(jsonLd);
    } catch {}
  }, []);

  const filteredServices = useMemo(() => {
    if (filter === 'Все' || filter === 'All') return services;
    const ruCategory = Object.keys(t.categories).find(key => t.categories[key as keyof typeof t.categories] === filter);
    return services.filter((service: Service) => service.category === (ruCategory || filter));
  }, [filter, t.categories]);

  const handleServiceSelect = useCallback((service: Service) => {
    setSelectedService(service);
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(services.map((s: Service) => s.category)));
    return [t.allCategories, ...uniqueCategories.map(cat => t.categories[cat as keyof typeof t.categories])];
  }, [t.allCategories, t.categories]);

  // Цвета для анимированных плашек карточек (более сочные)
  const cardColors = useMemo(() => [
    'bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600',
    'bg-gradient-to-r from-blue-600 via-cyan-400 to-cyan-600',
    'bg-gradient-to-r from-green-600 via-emerald-400 to-emerald-600',
    'bg-gradient-to-r from-orange-600 via-red-400 to-red-600',
    'bg-gradient-to-r from-indigo-600 via-purple-400 to-purple-600',
    'bg-gradient-to-r from-teal-600 via-green-400 to-green-600',
    'bg-gradient-to-r from-pink-600 via-rose-400 to-rose-600',
    'bg-gradient-to-r from-yellow-600 via-orange-400 to-orange-600',
    'bg-gradient-to-r from-cyan-600 via-blue-400 to-blue-600',
    'bg-gradient-to-r from-emerald-600 via-teal-400 to-teal-600',
    'bg-gradient-to-r from-violet-600 via-indigo-400 to-indigo-600',
    'bg-gradient-to-r from-rose-600 via-pink-400 to-pink-600',
    'bg-gradient-to-r from-amber-600 via-yellow-400 to-yellow-600',
    'bg-gradient-to-r from-lime-600 via-green-400 to-green-600',
  ], []);

  // Vanta.js background effect
  useEffect(() => {
    let vantaEffect: any;
    if (typeof window !== 'undefined' && (window as any).VANTA) {
      vantaEffect = (window as any).VANTA.NET({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0xaf3fff,
        backgroundColor: 0x3b2172,
        points: 4.00,
        maxDistance: 16.00
      });
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <header className="fixed top-[4.5625rem] sm:top-8 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-5xl rounded-lg bg-gradient-to-br from-blue-900/85 via-purple-900/85 to-indigo-900/85 backdrop-blur-md border border-white/20 px-2.5 py-1.5 sm:px-4 sm:py-2 flex justify-between items-center shadow-lg">
          <button
            onClick={() => {
              const heroSection = document.getElementById('hero');
              if (heroSection) {
                heroSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="text-xs sm:text-sm md:text-base font-bold hover:text-accent-green transition-colors leading-tight flex-shrink-0 mr-2"
          >
            LFG AI Market
          </button>
          <div className="flex items-center gap-0.5 ml-auto mr-1">
            <div className="flex gap-0.5">
              <button onClick={() => onLangChange('ru')} className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs transition-colors ${lang === 'ru' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>RU</button>
              <button onClick={() => onLangChange('en')} className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs transition-colors ${lang === 'en' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>EN</button>
            </div>
            <Button
              onClick={() => setShowServicesList(true)}
              variant="outline"
              className="liquid-outline-btn hover:bg-white/10 text-white hover:text-white h-7 px-1.5 text-[10px] sm:text-xs sm:h-8 sm:px-2 ml-0.5"
            >
              {t.servicesList}
            </Button>
            <TonConnectButton className="scale-[0.65] sm:scale-75 ml-0.25" />
          </div>
        </header>

        <main className="pt-20 sm:pt-20">
          <section id="hero" className="relative min-h-[70vh] overflow-hidden flex items-center justify-center pt-2 sm:pt-4">
            {/* Vanta.js background */}
            <div id="vanta-bg" className="absolute inset-0"></div>
            <div className="relative z-10 w-full max-w-5xl lg:max-w-6xl text-center px-4">
                            <Carousel opts={{ loop: true }} autoplayMs={7000} className="w-full relative" arrowsPosition="bottom">
                <CarouselContent>
                  {heroSlides.map((slide, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <div className="flex flex-col items-center justify-center p-4 md:p-6 min-h-[300px]">
                          <div className="mb-6 text-[12px] leading-[1.25] sm:text-sm sm:leading-snug text-light-cream/80">
                            {lang === 'ru' ? (
                              <>Первый и единственный маркетплейс AI-решений "под ключ" в Телеграм. Оплата в <span className="px-1.5 py-0.5 rounded-md text-white bg-blue-500/70 shadow-md backdrop-blur-sm animate-[pulse_3.2s_ease-in-out_infinite]">TON</span>.</>
                            ) : (
                              <>The first and only marketplace of turnkey AI solutions in Telegram. Pay in <span className="px-1.5 py-0.5 rounded-md text-white bg-blue-500/70 shadow-md backdrop-blur-sm animate-[pulse_3.2s_ease-in-out_infinite]">TON</span>.</>
                            )}
                          </div>
                          <h1 className="text-[26px] leading-[1.15] md:text-5xl font-bold mb-6 text-light-cream">{slide.title[lang]}</h1>
                          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto text-light-cream/90">{slide.subtitle[lang]}</p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {/* Arrows are handled by Carousel default when arrowsPosition="sides" */}
              </Carousel>
            </div>
          </section>

          <section id="services" className="py-14 md:py-20">
            <div className="container mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-light-cream">{t.servicesTitle}</h2>
              <div className="flex justify-center flex-wrap gap-1.5 sm:gap-2 mb-12 px-2">
                {categories.map((category: string) => (
                  <Button
                    key={category}
                    variant="outline"
                    onClick={() => setFilter(category)}
                    className={`category-filter-btn rounded-full transition-all duration-300 px-2.5 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm leading-tight ${filter === category ? 'active' : ''}`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredServices.map((service: Service, index: number) => (
                  <motion.div
                    key={service.packageId}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
                    className="flex"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <Card className={`glass-card ${service.isFeatured ? (service.featuredVariant === 'secondary' ? 'featured-secondary' : 'featured-primary') : ''} flex flex-col h-full w-full relative overflow-hidden`} data-service-index={index}>
                      {/* Анимированная цветная плашка */}
                      <div className={`h-[7px] w-full ${cardColors[index % cardColors.length]} animate-pulse`} />
                      <CardHeader className="p-4 md:p-6">
                        <h3 className="text-xl font-bold text-light-cream">{getText(service, 'packageName')}</h3>
                        <CardDescription className="text-light-cream/80 pt-2">{getText(service, 'painPoint')}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 md:p-6 flex-grow flex flex-col">
                        <Separator className="my-3 liquid-separator" />
                        <p className="mb-4 text-light-cream/90 text-sm">{getText(service, 'persuasiveDescription')}</p>
                        <div className="mt-auto">
                          <Separator className="my-3 liquid-separator" />
                          <div className="flex flex-col gap-3">
                             <div>
                               <div className="text-2xl font-bold text-accent-green">{lang === 'en' ? `$${(service.pricingTier1_Price / 90).toFixed(2)}` : `${service.priceTON} TON`}</div>
                              <div className="text-xs text-gold">{lang === 'en' ? `≈ ${service.priceTON} TON` : `≈ ${service.pricingTier1_Price.toLocaleString('ru-RU')} ₽`}</div>
                             </div>
                            <div className="flex gap-2 flex-wrap">
                              <Button
                                onClick={() => setSelectedService(service)}
                                className="liquid-outline-btn bg-blue-600 hover:bg-blue-700"
                              >
                                {t.payButton}
                              </Button>
                             <a href="https://t.me/ruhunt" target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" className="liquid-outline-btn">{t.helpButton}</Button>
                             </a>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section className="container mx-auto px-6 py-16 text-center">
            <h2 className="text-3xl font-bold mb-4">{t.customPaymentTitle}</h2>
            <p className="text-light-cream/90 mb-8 max-w-2xl mx-auto">{t.customPaymentSubtitle}</p>
            <div className="text-[10px] text-light-cream/70 text-center max-w-[300px] mx-auto mb-6 leading-tight">
              {t.paymentTermsNotice} <button onClick={() => setShowPrivacyModal(true)} className="text-blue-400 hover:text-blue-300 underline">{t.termsOfService}</button>
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-2">
                <PaymentSection lang={lang} />
              </div>
            </div>
          </section>
        </main>

        {selectedService && (
          <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
            <DialogContent className="liquid-surface border-gold/40 text-light-cream max-w-[400px] w-[92vw] max-h-[85vh] overflow-y-auto p-3 sm:p-4">
              <DialogHeader>
                <DialogTitle>{getText(selectedService, 'packageName')}</DialogTitle>
                <DialogDescription className="text-light-cream/80">{getText(selectedService, 'painPoint')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="font-semibold text-gold">{t.solution}</h3>
                  <p className="text-sm">{getText(selectedService, 'persuasiveDescription')}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gold">{t.deliverables}</h3>
                  <p className="text-sm">{getText(selectedService, 'keyDeliverables')}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gold">{t.benefit}</h3>
                  <p className="text-sm">{getText(selectedService, 'quantifiableBenefit')}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gold">{t.example}</h3>
                  <p className="text-sm not-italic font-examples liquid-surface p-3 rounded-md">{getText(selectedService, 'example')}</p>
                </div>
                <div className="text-[10px] text-light-cream/70 text-center leading-tight">
                  {t.paymentTermsNotice} <button onClick={() => setShowPrivacyModal(true)} className="text-blue-400 hover:text-blue-300 underline">{t.termsOfService}</button>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gold/20">
                <div>
                  <div className="text-2xl font-bold text-accent-green">{lang === 'en' ? `$${(selectedService.pricingTier1_Price / 90).toFixed(2)}` : `${selectedService.priceTON} TON`}</div>
                  <div className="text-xs text-gold">{lang === 'en' ? `≈ ${selectedService.priceTON} TON` : `≈ ${selectedService.pricingTier1_Price.toLocaleString('ru-RU')} ₽`}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <PaymentSection amount={selectedService.priceTON} lang={lang} comment={`[${selectedService.packageId}] ${getText(selectedService, 'packageName')}`} />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={showServicesList} onOpenChange={() => setShowServicesList(false)}>
          <DialogContent className="liquid-surface border-gold/40 text-light-cream max-h-[80vh] w-[92vw] max-w-[600px] p-3 sm:p-4 overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t.servicesList}</DialogTitle>
              <DialogDescription className="text-light-cream/80">
                {lang === 'ru' ? 'Полный список всех доступных услуг' : 'Complete list of all available services'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-4 max-h-96 overflow-y-auto">
              {services.map((service, index) => (
                <div
                  key={service.packageId}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => {
                    setShowServicesList(false);
                    setTimeout(() => {
                      // Прокрутка к конкретной карточке по индексу
                      const cardElement = document.querySelector(`[data-service-index="${index}"]`);
                      if (cardElement) {
                        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Добавим временную подсветку
                        cardElement.classList.add('ring-2', 'ring-yellow-400');
                        setTimeout(() => {
                          cardElement.classList.remove('ring-2', 'ring-yellow-400');
                        }, 2000);
                      }
                    }, 300);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gold min-w-[3rem]">#{index + 1}</span>
                    <div>
                      <div className="font-medium text-light-cream">{getText(service, 'packageName')}</div>
                      <div className="text-xs text-light-cream/60">{lang === 'en' ? t.categories[service.category as keyof typeof t.categories] : service.category}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-accent-green">{service.priceTON} TON</div>
                    <div className="text-xs text-gold">
                      {lang === 'ru' ? `${service.pricingTier1_Price.toLocaleString('ru-RU')} ₽` : `$${(service.pricingTier1_Price / 90).toFixed(2)}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <footer className="container mx-auto px-6 py-16 border-t border-white/10 mt-16">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">LFG AI Market</h3>
            <p className="text-blue-300">lfgsyndicate.ton</p>
            <p className="text-sm text-gray-400">{t.contacts}: <a href="https://t.me/ruhunt" target="_blank" rel="noopener noreferrer" className="text-blue-300">@ruhunt</a> • Официальный TG: <a href="https://t.me/LFGsyndicate" target="_blank" rel="noopener noreferrer" className="text-blue-300">@LFGsyndicate</a></p>
            <div className="pt-4">
              <button onClick={() => setShowPrivacyModal(true)} className="text-blue-400 hover:text-blue-300 underline text-sm">
                {t.privacyAndTerms}
              </button>
            </div>
            <div className="pt-4 text-xs text-gray-500">
              <p>© LFG AI Market</p>
              <p className="mt-2">{t.footerDisclaimer}</p>
            </div>
          </div>
        </footer>

        {/* Privacy Policy Modal */}
        <Dialog open={showPrivacyModal} onOpenChange={() => setShowPrivacyModal(false)}>
          <DialogContent className="liquid-surface border-gold/40 text-light-cream max-h-[90vh] w-[95vw] max-w-[800px] p-4 overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-light-cream">{t.privacyAndTerms}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4 text-sm leading-relaxed">
              <div>
                <h3 className="font-bold text-gold mb-3">{t.privacyPolicy.title}</h3>
                <div className="whitespace-pre-line text-light-cream/90">{t.privacyPolicy.userAgreement}</div>
              </div>
              <Separator className="my-6 liquid-separator" />
              <div>
                <div className="whitespace-pre-line text-light-cream/90">{t.privacyPolicy.publicOffer}</div>
              </div>
              <Separator className="my-6 liquid-separator" />
              <div>
                <div className="whitespace-pre-line text-light-cream/90">{t.privacyPolicy.privacyPolicy}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </LazyMotion>
  );
};

export default Index;