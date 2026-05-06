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
