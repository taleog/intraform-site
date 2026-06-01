// Intraform 2026 — scroll transformation + monochrome formation field
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  document.addEventListener('DOMContentLoaded', () => {
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

    initTransform();
    if (!prefersReduced) initCanvas();
  });

  function initTransform() {
    const section = $('.transform');
    const title = $('[data-morph-title]');
    const copy = $('[data-morph-copy]');
    const nodes = $$('.signal-node');
    const steps = $$('.transform-step');
    if (!section || !title || !copy || !steps.length) return;

    const read = (step) => {
      const [t, c] = (step.dataset.morph || '').split('|');
      return { title: t || 'Transform', copy: c || '' };
    };

    let active = -1;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const max = rect.height - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, max)));
      document.documentElement.style.setProperty('--progress', progress.toFixed(3));
      const idx = Math.min(steps.length - 1, Math.max(0, Math.floor(progress * steps.length)));
      if (idx !== active) {
        active = idx;
        const data = read(steps[idx]);
        title.textContent = `${data.title}.`;
        copy.textContent = data.copy;
        nodes.forEach((n, i) => n.classList.toggle('active', i <= idx));
      }
      requestAnimationFrame(update);
    };
    update();
  }

  function initCanvas() {
    const canvas = $('#formationCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let w = 0, h = 0, dpr = 1, points = [];
    let mouse = { x: -9999, y: -9999 };

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(92, Math.max(42, Math.floor(w * h / 19000)));
      points = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18,
        r: Math.random() * 1.4 + .35, phase: Math.random() * Math.PI * 2, i
      }));
    };
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener('pointerleave', () => { mouse.x = -9999; mouse.y = -9999; });
    resize();

    const tick = (t) => {
      ctx.clearRect(0, 0, w, h);
      const scroll = window.scrollY / Math.max(1, document.body.scrollHeight - innerHeight);
      for (const p of points) {
        const pullX = w / 2 + Math.cos(p.phase + scroll * Math.PI * 2) * w * .22;
        const pullY = h / 2 + Math.sin(p.phase * 1.7 + scroll * Math.PI * 2) * h * .22;
        p.vx += (pullX - p.x) * 0.000015;
        p.vy += (pullY - p.y) * 0.000015;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, dist = Math.hypot(dx, dy);
        if (dist < 150) { p.vx += dx / Math.max(30, dist) * .028; p.vy += dy / Math.max(30, dist) * .028; }
        p.x += p.vx; p.y += p.vy; p.vx *= .985; p.vy *= .985;
        if (p.x < -40) p.x = w + 40; if (p.x > w + 40) p.x = -40;
        if (p.y < -40) p.y = h + 40; if (p.y > h + 40) p.y = -40;
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i], b = points[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 140) {
            ctx.strokeStyle = `rgba(247,247,242,${(1 - dist / 140) * .105})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      for (const p of points) {
        ctx.fillStyle = `rgba(247,247,242,${.24 + Math.sin(t / 900 + p.phase) * .1})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
})();
