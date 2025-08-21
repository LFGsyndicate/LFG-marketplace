import { texts } from './i18n';

describe('i18n texts', () => {
  it('contains RU and EN keys with required fields', () => {
    for (const lang of ['ru', 'en'] as const) {
      const t = texts[lang];
      expect(t.servicesTitle).toBeTruthy();
      expect(t.customPaymentTitle).toBeTruthy();
      expect(t.customPaymentSubtitle).toBeTruthy();
      expect(t.helpButton).toBeTruthy();
      expect(t.solution).toBeTruthy();
      expect(t.deliverables).toBeTruthy();
      expect(t.benefit).toBeTruthy();
      expect(t.example).toBeTruthy();
      expect(t.contacts).toBeTruthy();
      expect(t.footerDisclaimer).toBeTruthy();
      expect(t.pay).toBeTruthy();
      expect(t.amountPlaceholder).toBeTruthy();
      expect(t.success).toBeTruthy();
      expect(t.error).toBeTruthy();
    }
  });
});

// Простые функции для тестов
function describe(name: string, fn: () => void) {
  console.log(`Testing: ${name}`);
  fn();
}

function it(name: string, fn: () => void) {
  console.log(`  - ${name}`);
  fn();
}

function expect(value: any) {
  return {
    toBeTruthy: () => {
      if (!value) {
        throw new Error(`Expected ${value} to be truthy`);
      }
    }
  };
}


