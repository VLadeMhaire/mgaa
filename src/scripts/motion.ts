/**
 * MGAA motion system
 * ------------------
 * Declarative, attribute-driven animations:
 *   data-reveal="up|left|right|zoom|blur|fade|image|kicker"
 *   data-split                -> headline words rise out of a mask
 *   data-stagger="90"         -> children reveal one after another
 *   data-stagger-base="200"   -> initial delay (ms) for a stagger group
 *   data-stagger-type="zoom"  -> reveal type for children without their own
 *   data-parallax="0.12"      -> background drifts slower than the page
 * Style hooks live in src/styles/animations.css
 */
const doc = document;
const root = doc.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 1. Split headlines into words (kept accessible via aria-label) */
function splitWords(el: HTMLElement) {
  if (el.hasAttribute('data-split-done')) return;
  el.setAttribute('aria-label', (el.textContent || '').replace(/\s+/g, ' ').trim());
  let i = 0;
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || '';
        if (!text.trim()) return;
        const frag = doc.createDocumentFragment();
        text.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(doc.createTextNode(part));
            return;
          }
          const outer = doc.createElement('span');
          outer.className = 'w';
          outer.setAttribute('aria-hidden', 'true');
          const inner = doc.createElement('span');
          inner.style.setProperty('--i', String(i++));
          inner.textContent = part;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        child.parentNode!.replaceChild(frag, child);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(el);
  el.setAttribute('data-split-done', '');
}
doc.querySelectorAll<HTMLElement>('[data-split]').forEach(splitWords);

/* 2. Stagger groups */
doc.querySelectorAll<HTMLElement>('[data-stagger]').forEach((parent) => {
  const step = parseInt(parent.dataset.stagger || '', 10) || 90;
  const base = parseInt(parent.dataset.staggerBase || '', 10) || 0;
  const type = parent.dataset.staggerType || 'up';
  Array.from(parent.children).forEach((child, i) => {
    const c = child as HTMLElement;
    c.style.setProperty('--d', base + i * step + 'ms');
    if (!c.hasAttribute('data-reveal')) c.setAttribute('data-reveal', type);
  });
});

/* 3. Prepare SVG icons for the "line draw" effect */
doc
  .querySelectorAll('.exp-icon svg, .pillar .ico svg')
  .forEach((svg) => svg.querySelectorAll('path, circle').forEach((p) => p.setAttribute('pathLength', '1')));

/* 4. Scroll-triggered reveals */
const targets = Array.from(doc.querySelectorAll<HTMLElement>('[data-reveal], [data-split]'));
if ('IntersectionObserver' in window && !reduce) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
  );
  targets.forEach((t) => io.observe(t));
} else {
  targets.forEach((t) => t.classList.add('is-in'));
}

/* 5. Count-up stats */
const nums = Array.from(doc.querySelectorAll<HTMLElement>('.stat .num'));
const parsed = nums.map((el) => {
  const m = (el.textContent || '').trim().match(/^(\d+)(.*)$/);
  return m ? { el, target: parseInt(m[1], 10), suffix: m[2] } : null;
});
if (!reduce && 'IntersectionObserver' in window) {
  parsed.forEach((p) => p && (p.el.textContent = '0' + p.suffix));
  const strip = doc.querySelector('.stat-strip');
  if (strip) {
    const countIO = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        countIO.disconnect();
        parsed.forEach((p, idx) => {
          if (!p) return;
          const start = performance.now() + 250 + idx * 110;
          const dur = 1500;
          const tick = (now: number) => {
            const t = Math.min(1, Math.max(0, (now - start) / dur));
            const eased = 1 - Math.pow(1 - t, 4);
            p.el.textContent = Math.round(p.target * eased) + p.suffix;
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      },
      { threshold: 0.5 }
    );
    countIO.observe(strip);
  }
}

/* 6. Scroll progress, header state, parallax (one rAF-throttled handler) */
const header = doc.querySelector('header');
const bar = doc.getElementById('scrollProgress');
const plx = Array.from(doc.querySelectorAll<HTMLElement>('[data-parallax]'));
let ticking = false;

function update() {
  ticking = false;
  const y = window.scrollY;
  const max = root.scrollHeight - window.innerHeight;
  if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
  header?.classList.toggle('is-scrolled', y > 24);
  if (reduce) return;
  plx.forEach((el) => {
    const host = el.parentElement;
    if (!host) return;
    const r = host.getBoundingClientRect();
    if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
    const speed = parseFloat(el.dataset.parallax || '0.12');
    const off = r.top + r.height / 2 - window.innerHeight / 2;
    el.style.translate = '0 ' + (-off * speed).toFixed(1) + 'px';
  });
}
function onScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(update);
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
update();

/* 7. Active nav link follows the section in view */
const links = Array.from(doc.querySelectorAll<HTMLAnchorElement>('.navlinks a[href^="#"]'));
const sectionMap = new Map<Element, HTMLAnchorElement>();
links.forEach((a) => {
  const s = doc.getElementById((a.getAttribute('href') || '').slice(1));
  if (s) sectionMap.set(s, a);
});
if ('IntersectionObserver' in window && sectionMap.size) {
  const navIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        const a = sectionMap.get(e.target);
        if (!a || !e.isIntersecting) return;
        links.forEach((l) => {
          l.classList.toggle('active', l === a);
          if (l === a) l.setAttribute('aria-current', 'true');
          else l.removeAttribute('aria-current');
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  sectionMap.forEach((_a, section) => navIO.observe(section));
}

/* 8. Cursor spotlight on cards (fine pointers only) */
if (!reduce && window.matchMedia('(hover: hover)').matches) {
  doc.querySelectorAll<HTMLElement>('.exp-card, .pillar, .principle-card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', e.clientX - r.left + 'px');
      card.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  });
}
