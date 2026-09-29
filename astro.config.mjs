import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://mgaa.iloilo.workers.dev',
  vite: {
    plugins: [tailwindcss()],
  },
});
