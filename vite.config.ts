import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Chemins relatifs : compatible GitHub Pages, Netlify et Vercel.
  base: './',
  build: { outDir: 'dist' },
  test: { include: ['src/**/*.test.ts'] },
});
