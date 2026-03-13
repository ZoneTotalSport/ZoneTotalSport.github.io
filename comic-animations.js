/* ============================================================
   ZONE TOTAL SPORT — Animations & Interactions partagées
   ============================================================ */

// ── RIPPLE EFFECT on buttons ──
function addRippleEffect(el, e) {
  const rect = el.getBoundingClientRect();
  const r = document.createElement('span');
  r.className = 'zts-ripple';
  r.style.left = (e.clientX - rect.left) + 'px';
  r.style.top  = (e.clientY - rect.top) + 'px';
  el.appendChild(r);
  setTimeout(() => r.remove(), 500);
}

document.addEventListener('click', e => {
  const btn = e.target.closest('button, .btn, [role="button"]');
  if (btn && !btn.disabled) addRippleEffect(btn, e);
});

// ── ANIMATED COUNTER ──
function animateCounter(el, target, duration = 800) {
  const start = parseInt(el.textContent) || 0;
  const step = (target - start) / (duration / 16);
  let current = start;
  const timer = setInterval(() => {
    current += step;
    if ((step > 0 && current >= target) || (step < 0 && current <= target)) {
      current = target;
      clearInterval(timer);
    }
    const numPart = el.textContent.replace(/[\d,]+/, '').trim();
    el.textContent = Math.round(current).toLocaleString('fr-CA') + (numPart ? ' ' + numPart : '');
    el.classList.add('animating');
    setTimeout(() => el.classList.remove('animating'), 400);
  }, 16);
}

// Run counter animation on stat pills
function animateStatPills() {
  document.querySelectorAll('.stat-pill, .header-badge').forEach(el => {
    const text = el.textContent;
    const num = parseInt(text.replace(/\s/g,''));
    if (num > 0) {
      const rest = text.replace(/^[\d\s,]+/, '');
      el.textContent = '0' + rest;
      setTimeout(() => {
        animateCounter(el, num);
      }, 300);
    }
  });
}

// ── SCROLL-REVEAL observer ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

function initScrollReveal() {
  document.querySelectorAll('.section-hero, .controls-bar, .stats-bar').forEach(el => {
    el.classList.add('scroll-reveal');
    revealObserver.observe(el);
  });
}

// ── GRID FILTER ANIMATION ──
function animateGridFilter(gridEl, renderFn) {
  if (!gridEl) { renderFn(); return; }
  gridEl.classList.add('filtering');
  setTimeout(() => {
    renderFn();
    gridEl.classList.remove('filtering');
  }, 200);
}

// ── CARD STAGGER (reset animation for new cards) ──
function restaggerCards(gridEl) {
  if (!gridEl) return;
  gridEl.querySelectorAll('.zts-card').forEach((card, i) => {
    card.style.animationDelay = Math.min(i * 0.04, 0.4) + 's';
    card.style.animationName = 'none';
    void card.offsetWidth; // reflow
    card.style.animationName = '';
  });
}

// ── SHAKE ANIMATION (for errors/empty results) ──
function shakeElement(el) {
  if (!el) return;
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = 'zts-shake 0.4s ease';
  setTimeout(() => el.style.animation = '', 400);
}

// ── CONFETTI BURST (for special actions) ──
function confettiBurst(x, y, count = 20) {
  const colors = ['#FFE000','#004EBF','#FF2828','#00CC44','#FF6B35'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:fixed; width:8px; height:8px; border-radius:2px;
      background:${colors[i % colors.length]};
      left:${x}px; top:${y}px; pointer-events:none; z-index:99999;
      transform-origin:center;
    `;
    document.body.appendChild(p);
    const angle = (Math.random() * 360) * Math.PI / 180;
    const velocity = 80 + Math.random() * 120;
    const vx = Math.cos(angle) * velocity;
    const vy = Math.sin(angle) * velocity - 100;
    let posX = x, posY = y, velY = vy, alpha = 1;
    const tick = setInterval(() => {
      posX += vx * 0.05;
      velY += 5; // gravity
      posY += velY * 0.05;
      alpha -= 0.02;
      p.style.left = posX + 'px';
      p.style.top  = posY + 'px';
      p.style.opacity = alpha;
      p.style.transform = `rotate(${posX * 3}deg)`;
      if (alpha <= 0) { clearInterval(tick); p.remove(); }
    }, 16);
  }
}

// ── FLOATING EMOJI (when adding to favorites/plan) ──
function floatEmoji(emoji, x, y) {
  const el = document.createElement('div');
  el.textContent = emoji;
  el.style.cssText = `
    position:fixed; left:${x}px; top:${y}px;
    font-size:2rem; pointer-events:none; z-index:99999;
    animation: zts-fadeInUp 0.3s ease, none;
    transition: transform 1s ease, opacity 1s ease;
  `;
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.transform = 'translateY(-80px) scale(1.5)';
    el.style.opacity = '0';
  });
  setTimeout(() => el.remove(), 1000);
}

// ── PULSE BADGE when count updates ──
function pulseBadge(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = 'zts-pop 0.4s cubic-bezier(0.34,1.4,0.64,1)';
}

// ── LOADING PROGRESS ANIMATION ──
function animateLoadBar(barId, percent) {
  const bar = document.getElementById(barId);
  if (bar) bar.style.width = percent + '%';
}

// ── INIT (called once DOM is ready) ──
function initZTSAnimations() {
  initScrollReveal();
  // Animate stat pills after a short delay
  setTimeout(animateStatPills, 600);
  // Add hover sound feedback (visual only — no audio)
  document.querySelectorAll('.zts-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.setProperty('--hover-scale', '1.02');
    });
  });
}

// Auto-init
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initZTSAnimations);
} else {
  initZTSAnimations();
}

// Export helpers for use in app files
window.ZTS = window.ZTS || {};
Object.assign(window.ZTS, {
  animateCounter,
  animateStatPills,
  animateGridFilter,
  restaggerCards,
  shakeElement,
  confettiBurst,
  floatEmoji,
  pulseBadge,
  animateLoadBar,
});
