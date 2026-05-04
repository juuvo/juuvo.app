// Year setter
(() => {
  const yr = new Date().getFullYear();
  const yrEl = document.getElementById("yr");
  if (yrEl) yrEl.textContent = yr;
  document.querySelectorAll(".menu-year").forEach(el => el.textContent = yr);
})();

// Highlight active nav link
(() => {
  const path = location.pathname.split('/').pop() || '';
  document.querySelectorAll('.topbar-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const isHome = (href === './' || href === '') && path === '';
    if (href === path || isHome) a.classList.add('is-active');
  });
})();

// Hamburger menu toggle (sidebar)
(() => {
  const btn = document.querySelector('.menu-btn');
  const overlay = document.querySelector('.menu-overlay');
  const backdrop = document.querySelector('.menu-backdrop');
  if (!btn || !overlay || !backdrop) return;

  const setOpen = (open) => {
    document.body.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open);
    overlay.setAttribute('aria-hidden', !open);
  };

  btn.addEventListener('click', () => {
    setOpen(!document.body.classList.contains('menu-open'));
  });

  backdrop.addEventListener('click', () => setOpen(false));

  overlay.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
})();

// Lenis smooth scroll (exposed as window.__lenis for page-specific hooks)
(() => {
  if (typeof Lenis === 'undefined') return;
  const lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  window.__lenis = lenis;
})();

// Animated plus-grid background in hero
(() => {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;

  const canvas = document.createElement('canvas');
  heroBg.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  const SPACING = 22;
  const DOT_RADIUS = 1;
  const ALPHA_MIN = 0.04;
  const ALPHA_MAX = 0.36;

  let width = 0, height = 0, dpr = 1, points = [];

  const resize = () => {
    dpr = window.devicePixelRatio || 1;
    const rect = heroBg.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    points = [];
    const cols = Math.ceil(width / SPACING) + 1;
    const rows = Math.ceil(height / SPACING) + 1;
    const offsetX = (width - (cols - 1) * SPACING) / 2;
    const offsetY = (height - (rows - 1) * SPACING) / 2;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        points.push({ x: offsetX + i * SPACING, y: offsetY + j * SPACING });
      }
    }
  };

  const drawFrame = (t) => {
    ctx.clearRect(0, 0, width, height);
    const time = t * 0.0007;
    const mid = (ALPHA_MIN + ALPHA_MAX) / 2;
    const range = (ALPHA_MAX - ALPHA_MIN) / 2;
    for (const p of points) {
      const wave =
        Math.sin(p.x * 0.012 + p.y * 0.006 + time) * 0.5 +
        Math.sin(p.x * 0.005 - p.y * 0.011 + time * 0.7) * 0.5;
      const alpha = mid + wave * range;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, DOT_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  resize();
  window.addEventListener('resize', resize);

  if (reduced) {
    drawFrame(0);
  } else {
    const loop = (t) => { drawFrame(t); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
})();

// Switch topbar color when scrolling into light area
(() => {
  const lightArea = document.querySelector('.light-area');
  if (!lightArea) return;
  const io = new IntersectionObserver((entries) => {
    document.body.classList.toggle('on-light', entries[0].isIntersecting);
  }, { rootMargin: '-60px 0px -100% 0px' });
  io.observe(lightArea);
})();

// Reveal on scroll into view
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  els.forEach(el => io.observe(el));
})();
