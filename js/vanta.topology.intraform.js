/*! Intraform organized topology background.
 * Keeps the p5 + VANTA.TOPOLOGY API requested for the homepage, but replaces the
 * stock random particle seeding with an even jittered field so the full-page
 * canvas does not bunch up or leave large empty areas.
 */
(() => {
  const root = window.VANTA || (window.VANTA = {});

  const toRgb = (value) => {
    const hex = typeof value === 'number' ? value : 0x505050;
    return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
  };

  root.TOPOLOGY = (opts = {}) => {
    const options = Object.assign({
      el: null,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1,
      scaleMobile: 1,
      color: 0x505050,
      backgroundColor: 0x000000
    }, opts);

    const el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el;
    if (!el || !window.p5) return null;

    let sketch;
    let particles = [];
    let frame = 0;
    let mouse = { x: 0.5, y: 0.5, active: false };
    const color = toRgb(options.color);
    const bg = toRgb(options.backgroundColor);

    const getHeight = () => Math.max(
      options.minHeight,
      el.clientHeight || 0,
      document.body ? document.body.scrollHeight : 0,
      document.documentElement ? document.documentElement.scrollHeight : 0,
      window.innerHeight || 0
    );

    const getWidth = () => Math.max(options.minWidth, el.clientWidth || window.innerWidth || 0);

    const api = {
      resize() {
        if (!sketch || !sketch._renderer) return;
        const width = Math.round(getWidth());
        const height = Math.round(getHeight());
        el.style.height = `${height}px`;
        sketch.resizeCanvas(width, height);
        buildField(width, height);
        prewarm(7);
      },
      destroy() {
        if (sketch && typeof sketch.remove === 'function') sketch.remove();
        particles = [];
      },
      setOptions(next = {}) {
        Object.assign(options, next);
      }
    };

    const buildField = (width, height) => {
      particles = [];
      const mobile = width < 720;
      // One particle per jittered cell: organized coverage, still randomized.
      const spacing = mobile ? 36 : 28;
      const cols = Math.ceil((width + spacing * 2) / spacing);
      const rows = Math.ceil((height + spacing * 2) / spacing);
      let seed = 0;

      for (let y = -1; y < rows - 1; y++) {
        for (let x = -1; x < cols - 1; x++) {
          const homeX = (x + 0.5 + sketch.random(-0.24, 0.24)) * spacing;
          const homeY = (y + 0.5 + sketch.random(-0.24, 0.24)) * spacing;
          particles.push({
            homeX,
            homeY,
            x: homeX,
            y: homeY,
            px: homeX,
            py: homeY,
            phase: sketch.random(sketch.TAU),
            speed: sketch.random(0.004, 0.010),
            drift: sketch.random(mobile ? 10 : 12, mobile ? 23 : 28),
            seed: seed++
          });
        }
      }
    };

    const paint = (warm = false) => {
      if (!particles.length) return;
      // Slow fade keeps the topology alive without creating dark blobs.
      sketch.noStroke();
      sketch.fill(bg[0], bg[1], bg[2], warm ? 16 : 8);
      sketch.rect(0, 0, sketch.width, sketch.height);

      sketch.stroke(color[0], color[1], color[2], warm ? 52 : 36);
      sketch.strokeWeight(1);

      const t = frame * 0.010;
      const mx = mouse.active && options.mouseControls ? (mouse.x - 0.5) * 0.7 : 0;
      const my = mouse.active && options.mouseControls ? (mouse.y - 0.5) * 0.7 : 0;

      for (const p of particles) {
        const n1 = sketch.noise(p.homeX * 0.0021, p.homeY * 0.0021, t + p.seed * 0.0007);
        const n2 = sketch.noise(p.homeY * 0.0028, p.homeX * 0.0028, t * 0.7 + p.seed * 0.0011);
        const angle = (n1 * 2.6 + n2 * 1.4 + mx + my) * sketch.TAU;
        const breathe = Math.sin(frame * p.speed + p.phase);
        const length = p.drift * (0.72 + n2 * 0.48);

        p.px = p.x;
        p.py = p.y;
        p.x = p.homeX + Math.cos(angle) * length + Math.cos(p.phase + frame * p.speed) * 3;
        p.y = p.homeY + Math.sin(angle) * length + breathe * 3;

        // Skip very long jumps after resize/wrap so the field stays clean.
        if (Math.hypot(p.x - p.px, p.y - p.py) < 34) {
          sketch.line(p.px, p.py, p.x, p.y);
        }
      }

      frame += warm ? 2 : 1;
    };

    const prewarm = (passes) => {
      if (!sketch) return;
      sketch.background(bg[0], bg[1], bg[2], 255);
      for (let i = 0; i < passes; i++) paint(true);
    };

    sketch = new window.p5((p) => {
      p.setup = () => {
        sketch = p;
        const width = Math.round(getWidth());
        const height = Math.round(getHeight());
        el.style.height = `${height}px`;
        const canvas = p.createCanvas(width, height);
        canvas.parent(el);
        p.pixelDensity(1);
        p.frameRate(24);
        p.smooth();
        buildField(width, height);
        prewarm(16);
      };

      p.draw = () => paint(false);
    });

    if (options.mouseControls) {
      window.addEventListener('mousemove', (event) => {
        mouse = { x: event.clientX / Math.max(1, window.innerWidth), y: event.clientY / Math.max(1, window.innerHeight), active: true };
      }, { passive: true });
    }

    if (options.touchControls) {
      window.addEventListener('touchmove', (event) => {
        const touch = event.touches && event.touches[0];
        if (!touch) return;
        mouse = { x: touch.clientX / Math.max(1, window.innerWidth), y: touch.clientY / Math.max(1, window.innerHeight), active: true };
      }, { passive: true });
    }

    return api;
  };
})();
