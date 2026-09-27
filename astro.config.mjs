import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.mgaa.ph',
  vite: {
    plugins: [tailwindcss()],
  },
});