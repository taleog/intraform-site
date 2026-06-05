/*! Intraform Vanta TOPOLOGY wrapper.
 * Keeps the original p5/Vanta topology flow-field look, but seeds particles with
 * stratified randomness and scales particle count for a full-page canvas so it
 * does not clump into one area or turn into repeated circles.
 */
(() => {
  const root = window.VANTA || (window.VANTA = {});

  const rgb = (value) => {
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

    let p5i;
    let particles = [];
    let flow = [];
    let cols = 0;
    let rows = 0;
    let frame = 0;
    let resizeQueued = false;
    let mouse = { x: 0, y: 0, active: false };
    const stroke = rgb(options.color);
    const bg = rgb(options.backgroundColor);

    const widthForEl = () => Math.max(options.minWidth, el.clientWidth || window.innerWidth || 0);
    const heightForEl = () => Math.max(
      options.minHeight,
      el.clientHeight || 0,
      document.body ? document.body.scrollHeight : 0,
      document.documentElement ? document.documentElement.scrollHeight : 0,
      window.innerHeight || 0
    );

    const wrap = (value, max) => ((value % max) + max) % max;

    const fieldVector = (p, x, y, radius) => {
      let high = 0;
      let low = 1;
      let highX = 0;
      let highY = 0;
      let lowX = 0;
      let lowY = 0;

      for (let i = 0; i < 64; i++) {
        const angle = (i / 64) * p.TAU;
        const px = x + p.cos(angle) * radius;
        const py = y + p.sin(angle) * radius;
        const n = p.noise(px, py);
        if (n > high) {
          high = n;
          highX = px;
          highY = py;
        }
        if (n < low) {
          low = n;
          lowX = px;
          lowY = py;
        }
      }

      const v = p.createVector(lowX - highX, lowY - highY);
      return v.normalize().mult(high - low);
    };

    const buildFlow = (p) => {
      cols = Math.ceil((p.width + 200) / 10);
      rows = Math.ceil((p.height + 200) / 10);
      flow = [];
      for (let y = 0; y < rows; y++) {
        const row = [];
        for (let x = 0; x < cols; x++) {
          row.push(fieldVector(p, 0.003 * x, 0.003 * y, 0.1));
        }
        flow.push(row);
      }
    };

    const seedParticles = (p) => {
      particles = [];
      const area = p.width * p.height;
      const target = Math.round(area / 650);
      const count = Math.max(4800, Math.min(target, 11500));
      const gridCols = Math.ceil(Math.sqrt(count * (p.width + 200) / (p.height + 200)));
      const gridRows = Math.ceil(count / gridCols);
      const cellW = (p.width + 200) / gridCols;
      const cellH = (p.height + 200) / gridRows;
      let seed = 0;

      for (let gy = 0; gy < gridRows; gy++) {
        for (let gx = 0; gx < gridCols && particles.length < count; gx++) {
          const x = (gx + p.random(0.14, 0.86)) * cellW;
          const y = (gy + p.random(0.14, 0.86)) * cellH;
          particles.push({
            prev: p.createVector(x, y),
            pos: p.createVector(x, y),
            vel: p.createVector(0, 0),
            acc: p.createVector(0, 0),
            seed: seed++
          });
        }
      }
    };

    const advance = (p, warm = false) => {
      p.translate(-100, -100);
      const maxX = p.width + 200;
      const maxY = p.height + 200;
      const mx = mouse.active && options.mouseControls ? (mouse.x - 0.5) * 0.018 : 0;
      const my = mouse.active && options.mouseControls ? (mouse.y - 0.5) * 0.018 : 0;

      for (const particle of particles) {
        const sx = p.constrain(particle.pos.x, 0, maxX);
        const sy = p.constrain(particle.pos.y, 0, maxY);
        const vector = flow[Math.floor(sy / 10)] && flow[Math.floor(sy / 10)][Math.floor(sx / 10)];

        particle.prev.x = particle.pos.x;
        particle.prev.y = particle.pos.y;
        particle.pos.x = wrap(particle.pos.x + particle.vel.x, maxX);
        particle.pos.y = wrap(particle.pos.y + particle.vel.y, maxY);
        particle.vel.add(particle.acc).normalize().mult(2.15);
        particle.acc = p.createVector(mx, my);
        if (vector) particle.acc.add(vector).mult(3);
      }

      p.strokeWeight(1);
      p.stroke(stroke[0], stroke[1], stroke[2], warm ? 18 : 13);
      for (const particle of particles) {
        if (window.p5.Vector.dist(particle.prev, particle.pos) < 10) {
          p.line(particle.prev.x, particle.prev.y, particle.pos.x, particle.pos.y);
        }
      }

      p.translate(100, 100);
      frame += 1;
    };

    const rebuild = (p, prewarm = true) => {
      const width = Math.round(widthForEl());
      const height = Math.round(heightForEl());
      el.style.height = `${height}px`;
      p.resizeCanvas(width, height);
      p.pixelDensity(1);
      p.background(bg[0], bg[1], bg[2], 255);
      buildFlow(p);
      seedParticles(p);
      if (prewarm) {
        p.push();
        for (let i = 0; i < 70; i++) advance(p, true);
        p.pop();
      }
    };

    const api = {
      resize() {
        if (!p5i || !p5i._renderer || resizeQueued) return;
        resizeQueued = true;
        window.requestAnimationFrame(() => {
          resizeQueued = false;
          rebuild(p5i, true);
        });
      },
      destroy() {
        if (p5i && typeof p5i.remove === 'function') p5i.remove();
        particles = [];
        flow = [];
      },
      setOptions(next = {}) {
        Object.assign(options, next);
      }
    };

    p5i = new window.p5((p) => {
      p.setup = () => {
        p5i = p;
        p.createCanvas(Math.round(widthForEl()), Math.round(heightForEl())).parent(el);
        p.pixelDensity(1);
        p.frameRate(30);
        p.smooth();
        p.noFill();
        rebuild(p, true);
      };

      p.draw = () => {
        p.push();
        advance(p, false);
        p.pop();
      };
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
