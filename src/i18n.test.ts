import { texts } from './i18n';

describe('i18n texts', () => {
  it('contains RU and EN keys with required fields', () => {
    for (const lang of ['ru', 'en'] as const) {
      const t = texts[lang];
      expect(t.title).toBeTruthy();
      expect(t.subtitle).toBeTruthy();
      expect(t.pay).toBeTruthy();
      expect(t.connect).toBeTruthy();
      expect(t.amountPlaceholder).toBeTruthy();
      expect(t.success).toBeTruthy();
      expect(t.error).toBeTruthy();
    }
  });
});


