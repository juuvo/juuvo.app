// Year setter
(() => {
  const yr = new Date().getFullYear();
  const yrEl = document.getElementById("yr");
  if (yrEl) yrEl.textContent = yr;
  document.querySelectorAll(".menu-year").forEach(el => el.textContent = yr);
})();

// Highlight active menu link
(() => {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.menu-link').forEach(a => {
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('is-active');
    }
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
