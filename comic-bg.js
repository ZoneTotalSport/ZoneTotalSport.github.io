/* comic-bg.js — Animated pop-art canvas background */
(function() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const BLUE   = '#004EBF';
  const YELLOW = '#FFE000';
  const NAVY   = '#001D6E';

  let W, H, dots, rays, ticker = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildDots();
  }

  function buildDots() {
    dots = [];
    const spacing = 30;
    for (let x = 0; x < W + spacing; x += spacing) {
      for (let y = 0; y < H + spacing; y += spacing) {
        dots.push({ x, y, r: 4 + Math.random() * 3 });
      }
    }
    rays = [];
    const cx = W, cy = H;
    const numRays = 24;
    for (let i = 0; i < numRays; i++) {
      rays.push({ angle: (i / numRays) * Math.PI * 2 });
    }
  }

  function draw() {
    ticker++;
    ctx.clearRect(0, 0, W, H);

    // Base gradient
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#f0f4ff');
    bg.addColorStop(1, '#fff8d0');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Burst rays from bottom-right corner
    const cx = W * 0.95, cy = H * 0.95;
    const numRays = 20;
    const pulse = Math.sin(ticker * 0.008) * 0.02;
    for (let i = 0; i < numRays; i++) {
      const a1 = ((i / numRays) + ticker * 0.0003) * Math.PI * 2;
      const a2 = a1 + Math.PI / numRays;
      const len = Math.max(W, H) * 2.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, len, a1, a2);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0
        ? `rgba(255,224,0,${0.12 + pulse})`
        : `rgba(0,78,191,${0.06 + pulse})`;
      ctx.fill();
    }

    // Ben-Day dots
    const offset = (ticker * 0.3) % 30;
    for (const d of dots) {
      const nx = ((d.x + offset) % (W + 30)) - 15;
      const ny = ((d.y + offset * 0.5) % (H + 30)) - 15;
      const dist = Math.hypot(nx - W * 0.5, ny - H * 0.5) / Math.max(W, H);
      const alpha = 0.06 + dist * 0.10;
      ctx.beginPath();
      ctx.arc(nx, ny, d.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,29,110,${alpha})`;
      ctx.fill();
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize();
  draw();
})();
