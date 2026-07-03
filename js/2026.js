// Intraform 2026 — interface motion
(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  document.addEventListener('DOMContentLoaded', () => {
    const initVantaBackground = () => {
      const bg = $('#vanta-bg');
      if (!bg) return;

      const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isMobileCanvas = window.matchMedia && window.matchMedia('(max-width: 760px)').matches;
      let effect;
      let resizeTimer;
      let scrollTimer;
      let bootAttempts = 0;
      let snapshotAttempts = 0;

      const hasVanta = () => Boolean(window.VANTA && window.VANTA.TOPOLOGY);

      const retryStart = () => {
        if (hasVanta()) {
          start();
          return;
        }
        bootAttempts += 1;
        if (bootAttempts > 32) {
          bg.classList.add('vanta-fallback-lines');
          return;
        }
        window.setTimeout(retryStart, Math.min(90 + bootAttempts * 35, 420));
      };

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

      const canvasHasLines = (canvas) => {
        const ctx = canvas.getContext && canvas.getContext('2d');
        if (!ctx) return true;
        const width = canvas.width;
        const height = canvas.height;
        if (!width || !height) return false;
        const samples = [
          [0.18, 0.18], [0.42, 0.2], [0.72, 0.24],
          [0.28, 0.48], [0.58, 0.52], [0.84, 0.58],
          [0.2, 0.78], [0.5, 0.82], [0.78, 0.84]
        ];
        try {
          return samples.some(([x, y]) => {
            const px = ctx.getImageData(Math.floor(width * x), Math.floor(height * y), 1, 1).data;
            return px[0] > 18 || px[1] > 18 || px[2] > 18;
          });
        } catch (_) {
          return true;
        }
      };

      const primeMobileSnapshot = () => {
        if (!isMobileCanvas) return false;
        if (bg.classList.contains('vanta-mobile-static')) return true;
        const canvas = bg.querySelector('canvas');
        if (!canvas || !canvas.width || !canvas.height) return false;
        if (!canvasHasLines(canvas)) return false;
        try {
          bg.style.backgroundImage = `url(${canvas.toDataURL('image/jpeg', 0.62)})`;
          bg.style.backgroundSize = '100% 100%';
          bg.style.backgroundRepeat = 'no-repeat';
          bg.style.backgroundPosition = 'top center';
          bg.classList.add('vanta-has-snapshot', 'vanta-mobile-static');
          window.setTimeout(() => {
            if (effect && typeof effect.destroy === 'function') {
              try { effect.destroy(); } catch (_) {}
              effect = null;
            }
          }, 80);
          return true;
        } catch (_) {
          return false;
        }
      };

      const queueMobileSnapshot = (delay = 900) => {
        if (!isMobileCanvas || bg.classList.contains('vanta-mobile-static')) return;
        window.setTimeout(() => {
          requestAnimationFrame(() => {
            if (primeMobileSnapshot()) return;
            snapshotAttempts += 1;
            if (snapshotAttempts < 8) queueMobileSnapshot(450);
          });
        }, delay);
      };

      const start = () => {
        if (!hasVanta() || effect) return;
        fitToPage();

        effect = window.VANTA.TOPOLOGY({
          el: bg,
          mouseControls: !isMobileCanvas,
          touchControls: !isMobileCanvas,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0xc8c8c8,
          backgroundColor: 0x000000
        });
        bg.classList.add('vanta-active');

        requestAnimationFrame(() => {
          fitToPage();
          queueMobileSnapshot(900);
          queueMobileSnapshot(2200);
        });
      };

      if (reduceMotion) {
        bg.classList.add('vanta-reduced-motion', 'vanta-fallback-lines');
        return;
      }

      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(retryStart, { timeout: 450 });
      } else {
        window.requestAnimationFrame(retryStart);
      }

      window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
          if (isMobileCanvas && !bg.classList.contains('vanta-mobile-static')) {
            bg.classList.remove('vanta-has-snapshot');
            bg.style.backgroundImage = '';
          }
          fitToPage();
          queueMobileSnapshot(1000);
        }, 160);
      }, { passive: true });

      if (isMobileCanvas) {
        window.addEventListener('scroll', () => {
          bg.classList.add('vanta-mobile-scrolling');
          window.clearTimeout(scrollTimer);
          scrollTimer = window.setTimeout(() => bg.classList.remove('vanta-mobile-scrolling'), 180);
        }, { passive: true });
      }

      window.addEventListener('load', () => {
        fitToPage();
        queueMobileSnapshot(900);
      }, { once: true });
      window.setTimeout(() => {
        fitToPage();
        queueMobileSnapshot(900);
      }, 1200);
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
