// Intraform 2026 — interface motion
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  document.addEventListener('DOMContentLoaded', () => {
    const initVantaBackground = () => {
      const bg = $('#vanta-bg');
      if (!bg || !window.VANTA || !window.VANTA.TOPOLOGY) return;

      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobileCanvas = window.matchMedia && window.matchMedia('(max-width: 760px)').matches;
      let effect;
      let resizeTimer;

      const fitToPage = () => {
        const doc = document.documentElement;
        const body = document.body;
        const height = Math.max(
          window.innerHeight || 0,
          doc ? doc.scrollHeight : 0,
          body ? body.scrollHeight : 0,
          bg.scrollHeight || 0
        );
        bg.style.height = `${height}px`;
        if (effect && typeof effect.resize === 'function') {
          requestAnimationFrame(() => effect.resize());
        }
      };

      const start = () => {
        fitToPage();

        effect = window.VANTA.TOPOLOGY({
          el: bg,
          mouseControls: true,
          touchControls: !isMobileCanvas,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x505050,
          backgroundColor: 0x000000
        });

        requestAnimationFrame(fitToPage);
      };

      if (reduceMotion) {
        bg.classList.add('vanta-reduced-motion');
        return;
      }

      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(start, { timeout: 700 });
      } else {
        window.requestAnimationFrame(start);
      }

      window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(fitToPage, 160);
      }, { passive: true });
      window.addEventListener('load', fitToPage, { once: true });
      window.setTimeout(fitToPage, 1200);
    };

    initVantaBackground();

    const revealEls = $$('[data-reveal]');
    if (revealEls.length) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -80px 0px', threshold: 0.12 });
      revealEls.forEach((el, i) => {
        el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
        observer.observe(el);
      });
    }

    const nav = $('.nav');
    if (nav) {
      let lastY = window.scrollY;
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        nav.classList.toggle('hidden', y > 180 && y > lastY);
        lastY = Math.max(0, y);
      }, { passive: true });
    }

    const menu = $('.menu-btn');
    const navRight = $('.nav-right');
    if (menu && navRight) {
      menu.addEventListener('click', () => {
        const open = menu.getAttribute('aria-expanded') === 'true';
        menu.setAttribute('aria-expanded', String(!open));
        navRight.style.display = open ? '' : 'flex';
      });
    }
  });
})();
