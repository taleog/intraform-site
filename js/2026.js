// Intraform 2026 — interface motion
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  document.addEventListener('DOMContentLoaded', () => {
    const initVantaBackground = () => {
      const bg = $('#vanta-bg');
      if (!bg || !window.VANTA || !window.VANTA.NET) return;

      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobile = window.innerWidth < 720;
      let effect;
      let resizeTimer;

      const fitToDocument = () => {
        const doc = document.documentElement;
        const height = Math.max(
          document.body ? document.body.scrollHeight : 0,
          doc ? doc.scrollHeight : 0,
          window.innerHeight
        );
        bg.style.height = `${height}px`;
        if (effect && typeof effect.resize === 'function') {
          requestAnimationFrame(() => effect.resize());
        }
      };

      fitToDocument();

      const start = () => {
        effect = window.VANTA.NET({
          el: bg,
          mouseControls: false,
          touchControls: false,
          gyroControls: false,
          minHeight: window.innerHeight,
          minWidth: 200,
          scale: 1.35,
          scaleMobile: 1.7,
          color: 0x6a6a6a,
          backgroundColor: 0x030303,
          points: isMobile ? 9 : 16,
          maxDistance: isMobile ? 18 : 25,
          spacing: isMobile ? 19 : 14,
          showDots: false
        });

        if (effect && effect.renderer && typeof effect.renderer.setPixelRatio === 'function') {
          effect.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1));
        }

        fitToDocument();
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
        resizeTimer = window.setTimeout(fitToDocument, 160);
      }, { passive: true });
      window.addEventListener('load', fitToDocument, { once: true });
      window.setTimeout(fitToDocument, 450);
      window.setTimeout(fitToDocument, 1400);
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
