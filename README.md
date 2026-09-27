# Medez-Galanto & Associates — Astro + Tailwind

Migration of the MGAA marketing site from vanilla HTML/CSS/JS to **Astro** with **Tailwind CSS**.

## What's preserved
- Full visual design, dark/light theme toggle (persisted in `localStorage`), mobile nav, the draggable/swipeable team carousel, and the mailto-based contact form all work exactly as before.
- All images (logo, hero photo, 6 team headshots, and the two building background photos) were extracted from the original inline base64 data into real files under `public/images/`.

## Structure
```
src/
  layouts/Layout.astro     head, fonts, meta tags, theme-flash-prevention script
  components/
    Header.astro           nav, theme toggle, mobile menu (+ scripts)
    Hero.astro
    TrustBand.astro
    About.astro
    Expertise.astro
    Team.astro              carousel data + drag/swipe/keyboard script
    Philosophy.astro
    Contact.astro           form + Gmail-compose script
    Footer.astro
  pages/index.astro         assembles all sections
  styles/global.css         Tailwind directives + design tokens/component styles
public/images/               logo, hero photo, team photos, building photos
```

## Why some styling lives in `global.css` instead of utility classes
Tailwind is fully wired up (via `@astrojs/tailwind`) and used for the base reset and is available for any new work. The original design relies heavily on layered `box-shadow`s, gradient masks, a 3D carousel transform, and CSS custom properties that flip between a dark and light theme via a single `data-theme` attribute. Re-encoding all of that as inline Tailwind utility strings would balloon every element's `class` attribute and risk subtly breaking the exact look. Instead, those rules were ported almost 1:1 into `global.css` inside `@layer components`, keyed to the same class names as the original site, and driven by the same CSS variables. Tailwind's `content` scanning still applies to any new classes you add in components going forward.

## Commands
```bash
npm install
npm run dev       # local dev server
npm run build     # outputs static site to dist/
npm run preview   # preview the production build
```
