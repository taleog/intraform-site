// Intraform background — horizontal sweep
(() => {
  const bg = document.getElementById('vanta-bg');
  if (!bg) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    bg.classList.add('vanta-fallback-lines');
    return;
  }

  const isMobile = window.matchMedia('(max-width: 760px)').matches;
  let p5Instance = null;

  const waitForP5 = (attempts = 0) => {
    if (typeof window.p5 !== 'undefined' && typeof window.p5 !== 'boolean') {
      startP5();
      return;
    }
    if (attempts > 40) {
      bg.classList.add('vanta-fallback-lines');
      return;
    }
    setTimeout(() => waitForP5(attempts + 1), 120);
  };

  const startP5 = () => {
    new window.p5((p) => {
      let particles = [];
      let frame = 0;

      p.setup = () => {
        const w = Math.max(bg.offsetWidth, window.innerWidth);
        const h = Math.max(bg.offsetHeight, window.innerHeight, document.documentElement.scrollHeight);
        let canvas = p.createCanvas(w, h);
        canvas.parent(bg);
        canvas.style('position', 'absolute');
        canvas.style('z-index', '0');
        canvas.style('top', '0');
        canvas.style('left', '0');
        canvas.style('pointer-events', 'none');
        p.pixelDensity(1);
        p.smooth();
        p.noStroke();

        // Create particles — stratified vertical bands, faster at bottom
        const count = Math.min(12000, Math.max(4000, Math.round(w * h / 500)));
        const cols = Math.ceil(Math.sqrt(count * w / h));
        const rows = Math.ceil(count / cols);
        const cw = w / cols;
        const rh = h / rows;

        for (let i = 0; i < count; i++) {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = (col + p.random(0.1, 0.9)) * cw;
          const y = (row + p.random(0.1, 0.9)) * rh;
          const speed = p.map(y, 0, h, 0.002, 0.008) * 2.5;
          particles.push({
            px: x, py: y,
            x: x, y: y,
            vx: speed, vy: 0,
          });
        }

        bg.classList.add('vanta-active');

        // On mobile: snapshot after delay then destroy
        if (isMobile) {
          setTimeout(() => {
            try {
              bg.style.backgroundImage = `url(${canvas.elt.toDataURL('image/jpeg', 0.62)})`;
              bg.style.backgroundSize = '100% 100%';
              bg.classList.add('vanta-mobile-static');
              setTimeout(() => {
                if (p5Instance) { p5Instance.remove(); p5Instance = null; }
              }, 80);
            } catch(_) {}
          }, 1200);
        }
      };

      p.draw = () => {
        frame++;
        p.background(0);

        // Speed curve: fast initial reveal, then settle
        const k = Math.min(1, frame / 120);
        const spd = 1.8 * (1 - k) + 0.3 * k;

        p.strokeWeight(1);
        p.stroke(200, 200, 200, 56); // rgba(200,200,200,0.22)

        for (let i = 0; i < particles.length; i++) {
          const pt = particles[i];
          const nx = p.noise(pt.x * 0.004, pt.y * 0.002 + frame * 0.002) - 0.5;
          const ny = p.noise(pt.y * 0.003, pt.x * 0.004 + frame * 0.001) - 0.5;

          pt.px = pt.x;
          pt.py = pt.y;
          pt.vx += nx * 0.035 * spd;
          pt.vy += ny * 0.008 * spd;
          const m = Math.max(0.92, 1 - Math.sqrt(pt.vx*pt.vx + pt.vy*pt.vy) / 6);
          pt.vx *= m;
          pt.vy *= m;
          pt.vx *= 1.04;
          pt.x = ((pt.x + pt.vx) % (w + 200) + (w + 200)) % (w + 200) - 100;
          pt.y = ((pt.y + pt.vy) % (h + 200) + (h + 200)) % (h + 200) - 100;

          p.line(pt.px, pt.py, pt.x, pt.y);
        }
      };

      p.windowResized = () => {
        const w = Math.max(bg.offsetWidth, window.innerWidth);
        const h = Math.max(bg.offsetHeight, window.innerHeight, document.documentElement.scrollHeight);
        p.resizeCanvas(w, h);
      };
    });
  };

  waitForP5();
})();