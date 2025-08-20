import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  base: '/', // для корректного роутинга на проде (Vercel)
  server: {
    fs: {
      // разрешаем импортировать файлы за пределами корня проекта (для доступа к ../src/data/services.ts)
      allow: ['..']
    }
  },
  build: {
    outDir: 'dist'
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [resolve(fileURLToPath(new URL('./vitest.setup.ts', import.meta.url)))]
  }
});


