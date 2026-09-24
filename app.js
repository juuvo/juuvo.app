// Year setter
(() => {
  const yearEl = document.getElementById('yr');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
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

// Lenis smooth scroll
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
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  els.forEach(el => io.observe(el));
})();

// Animated drifting ribbons — runs on every <canvas class="hero-bg-canvas"> on the page.
// Ribbon count is read from data-ribbons (default 3); subpages typically use 1.
(() => {
  const canvases = document.querySelectorAll('.hero-bg-canvas');
  if (!canvases.length) return;
  canvases.forEach(setupRibbonCanvas);

  function setupRibbonCanvas(canvas) {
    const container = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const RIBBON_COUNT = Math.max(1, parseInt(canvas.dataset.ribbons || '3', 10));

    let dpr = 1, width = 0, height = 0;
    let ribbons = [];
    let rafId = null;

    const initRibbons = () => {
      ribbons = [];
      // For a single ribbon center it; otherwise spread vertically.
      for (let i = 0; i < RIBBON_COUNT; i++) {
        const baseY = RIBBON_COUNT === 1
          ? height * 0.55
          : height * (0.28 + i * 0.22);
        ribbons.push({
          baseY,
          amplitude: 26 + i * 6,
          freq: 0.007 + i * 0.002,
          phaseSpeed: 0.00028 + i * 0.00006,
          yDriftSpeed: 0.00012,
          yDriftAmount: 22,
          alpha: 0.11 - i * 0.02,
          alphaAmp:   0.07 - i * 0.01,
          alphaFreq:  0.0045 + i * 0.0010,
          alphaSpeed: 0.00060 + i * 0.00018,
          alphaSeed:  Math.random() * 100,
          lineWidth: 48 + i * 12,
          seed: Math.random() * 100,
        });
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initRibbons();
    };

    const drawFrame = (now) => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const STOPS = 24;

      for (const rib of ribbons) {
        const phase = now * rib.phaseSpeed + rib.seed;
        const yShift = Math.sin(now * rib.yDriftSpeed + rib.seed) * rib.yDriftAmount;

        const grad = ctx.createLinearGradient(0, 0, width, 0);
        for (let i = 0; i <= STOPS; i++) {
          const xAt = (width * i) / STOPS;
          const a = rib.alpha
            + Math.sin(xAt * rib.alphaFreq + now * rib.alphaSpeed + rib.alphaSeed) * rib.alphaAmp;
          grad.addColorStop(i / STOPS, `rgba(0, 0, 0, ${Math.max(0, a)})`);
        }
        ctx.strokeStyle = grad;
        ctx.lineWidth = rib.lineWidth;
        ctx.beginPath();
        for (let x = -20; x <= width + 20; x += 6) {
          const y = rib.baseY + yShift + Math.sin(x * rib.freq + phase) * rib.amplitude;
          if (x === -20) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    const tick = (now) => {
      drawFrame(now);
      rafId = requestAnimationFrame(tick);
    };

    const start = () => { if (!rafId && !reduced) rafId = requestAnimationFrame(tick); };
    const stop  = () => { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } };

    resize();
    window.addEventListener('resize', resize);

    if (reduced) { drawFrame(0); return; }

    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) start(); else stop();
    }, { threshold: 0.05 });
    io.observe(container);
  }
})();


// Hero mockups — word screens of every app, in a random order on each visit.
// iPad and iPhone show the same app; an app without an iPad screen keeps the previous iPad slide.
(() => {
  const screens = document.querySelectorAll('.device-screen[data-device]');
  if (!screens.length) return;

  // hero-screens/<device>/<product>.webp
  const SCREENS = {
    iphone: ['topik8000', 'hanken6000', 'hsk11092', 'chuken8000', 'tocfl8000', 'ielts4000',
             'toefl5000', 'futsuken9000', 'dele6000', 'jlpt10000'],
    ipad:   ['topik8000', 'hanken6000', 'hsk11092', 'chuken8000', 'tocfl8000', 'ielts4000',
             'toefl5000', 'futsuken9000', 'jlpt10000'],
  };

  const order = [...SCREENS.iphone];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fadeMs = 700; // must match the CSS .is-active transition duration
  const cycleMs = 4000;

  const devices = [...screens].map((screen) => {
    const device = screen.dataset.device;
    const available = new Set(SCREENS[device] || []);
    const slides = new Map();
    order.forEach((product) => {
      if (!available.has(product)) return;
      const img = document.createElement('img');
      img.className = 'mockup-slide';
      img.alt = '';
      img.decoding = 'async';
      img.dataset.src = `hero-screens/${device}/${product}.webp`;
      screen.appendChild(img);
      slides.set(product, img);
    });
    return { slides, current: null };
  });

  const load = (img) => {
    if (img && img.dataset.src) {
      img.src = img.dataset.src;
      delete img.dataset.src;
    }
  };

  const show = (dev, product) => {
    const next = dev.slides.get(product);
    if (!next || next === dev.current) return;
    load(next);
    const prev = dev.current;
    next.classList.add('is-active');
    dev.current = next;
    if (prev) setTimeout(() => prev.classList.remove('is-active'), fadeMs);
  };

  // Preload the slide after `index` for every device so the next fade is smooth
  const preload = (index) => {
    const product = order[(index + 1) % order.length];
    devices.forEach((dev) => load(dev.slides.get(product)));
  };

  let index = 0;
  devices.forEach((dev) => show(dev, order[0]));
  // The first app might have no iPad screen: fall back to the first one that does
  devices.forEach((dev) => {
    if (!dev.current) show(dev, order.find((product) => dev.slides.has(product)));
  });
  if (reduced) return;
  preload(index);

  const tick = () => {
    index = (index + 1) % order.length;
    const product = order[index];
    devices.forEach((dev, i) => setTimeout(() => show(dev, product), i * 250));
    preload(index);
  };

  let intervalId = null;
  const start = () => { if (!intervalId) intervalId = setInterval(tick, cycleMs); };
  const stop = () => { if (intervalId) { clearInterval(intervalId); intervalId = null; } };

  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) start(); else stop();
  }, { threshold: 0.1 });
  io.observe(screens[0].closest('.hero-mockups') || screens[0]);
})();

// Auto-rotate the active principle card on home (Dub-style focus cycle)
(() => {
  const grid = document.querySelector('.philosophy-grid');
  if (!grid) return;
  const cards = grid.querySelectorAll('.principle-card');
  if (cards.length < 2) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cycleMs = 5000;

  let activeIndex = 0;
  let intervalId = null;
  let isHovered = false;

  const tick = () => { if (!isHovered) advance(); };

  const setActive = (index) => {
    activeIndex = index;
    // Remove from all, then force a reflow on the target before re-adding —
    // ensures the @keyframes restarts even when the same card is reactivated.
    cards.forEach((card) => card.classList.remove('is-active'));
    void cards[index].offsetWidth;
    cards[index].classList.add('is-active');
    // Realign interval so the next advance is always cycleMs from this moment.
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = setInterval(tick, cycleMs);
    }
  };

  const advance = () => setActive((activeIndex + 1) % cards.length);

  const start = () => {
    if (intervalId || reduced) return;
    intervalId = setInterval(tick, cycleMs);
    setActive(activeIndex);
  };

  const stop = () => {
    if (!intervalId) return;
    clearInterval(intervalId);
    intervalId = null;
  };

  if (reduced) {
    cards.forEach(c => c.classList.add('is-active'));
    return;
  }

  setActive(0);

  cards.forEach((card, i) => {
    card.addEventListener('mouseenter', () => {
      isHovered = true;
      setActive(i);
    });
  });
  grid.addEventListener('mouseleave', () => { isHovered = false; });

  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) start();
    else stop();
  }, { threshold: 0.3 });
  io.observe(grid);
})();
