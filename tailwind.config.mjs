/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  darkMode: ['selector', ':root:not([data-theme="light"])'],
  theme: {
    extend: {
      colors: {
        'navy-deep': 'var(--navy-deep)',
        navy: 'var(--navy)',
        'navy-mid': 'var(--navy-mid)',
        'navy-card': 'var(--navy-card)',
        blue: 'var(--blue)',
        'blue-bright': 'var(--blue-bright)',
        ink: 'var(--ink)',
        slate: 'var(--slate)',
        'slate-dim': 'var(--slate-dim)',
        line: 'var(--line)',
      },
      fontFamily: {
        oswald: ['Oswald', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      maxWidth: {
        wrap: '1160px',
      },
      boxShadow: {
        'blue-glow': '0 0 10px var(--blue-bright)',
      },
    },
  },
  plugins: [],
};
