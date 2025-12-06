/* ==========================================================
   Phase 1 — Premium Scorpius Connect Reveal
   - Soft glow stars
   - Smooth line drawing (easing)
   - Breathing aura
   - Cinematic typewriter
========================================================== */

const canvas = document.getElementById("p1Canvas");
const ctx = canvas.getContext("2d");

const textEl = document.getElementById("p1Text");
const nextEl = document.getElementById("p1Next");

/* ---------- Resize ---------- */
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener("resize", resize);

/* ==========================================================
   CONSTELLATION POINTS (normalized)
========================================================== */

const SCORPIUS = [
  { x: 0.32, y: 0.22 },
  { x: 0.42, y: 0.32 },
  { x: 0.51, y: 0.40 },
  { x: 0.55, y: 0.50 },
  { x: 0.48, y: 0.62 },
  { x: 0.42, y: 0.75 },
  { x: 0.53, y: 0.83 }
];

let pts = [];

function convertPoints() {
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;

  pts = SCORPIUS.map(p => ({
    x: p.x * w,
    y: p.y * h
  }));
}
convertPoints();

/* ==========================================================
   ANIMATION STATE
========================================================== */

let reveal = 0;                // 0 → 1 for full constellation
let speed = 0.004;             // reveal speed
let t0 = performance.now();

let nextShown = false;

/* ==========================================================
   DRAWING
========================================================== */

function drawBackground() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;

  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#07041f");
  g.addColorStop(1, "#020013");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawAura(t) {
  const c = pts[Math.floor(pts.length / 2)];
  const r = canvas.width * 0.25 * reveal;

  const breath = 0.8 + 0.2 * Math.sin(t * 0.0018);

  const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r * breath);
  grad.addColorStop(0, "rgba(160,200,255,0.25)");
  grad.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = grad;
  ctx.fillRect(c.x - r, c.y - r, r * 2, r * 2);
}

function drawStars(t) {
  pts.forEach((p, i) => {
    const progress = Math.min(1, reveal * pts.length - i);
    if (progress <= 0) return;

    const pulse = 0.6 + 0.4 * Math.sin(t * 0.003 + i);
    const size = (4 + pulse * 3) * progress;

    // Glow
    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${0.12 * progress})`;
    ctx.arc(p.x, p.y, size * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Core star
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawLines() {
  ctx.strokeStyle = "rgba(255,255,255,0.82)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  for (let i = 0; i < pts.length - 1; i++) {
    const p = reveal * pts.length;

    if (i + 1 <= p) {
      ctx.moveTo(pts[i].x, pts[i].y);

      if (i + 1 < p) {
        ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
      } else {
        // partial segment
        const k = p - i;
        const x = pts[i].x + (pts[i + 1].x - pts[i].x) * k;
        const y = pts[i].y + (pts[i + 1].y - pts[i].y) * k;

        ctx.lineTo(x, y);
      }
    }
  }
  ctx.stroke();
}

/* ==========================================================
   MAIN LOOP
========================================================== */

function animate(t) {
  drawBackground();

  reveal = Math.min(1, reveal + speed);

  drawAura(t);
  drawStars(t);
  drawLines();

  if (reveal === 1 && !nextShown) {
    nextShown = true;
    setTimeout(() => {
      nextEl.classList.add("visible");
    }, 400);
  }

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

/* ==========================================================
   TYPEWRITER TEXT
========================================================== */

const line =
  "Before anything shines in the universe, Scorpius breathes first.";

let index = 0;
let typing = true;

function typewriter() {
  const speed = 42;

  const timer = setInterval(() => {
    if (index >= line.length) {
      clearInterval(timer);
      typing = false;
      return;
    }

    const ch = line[index];
    textEl.textContent = line.slice(0, index + 1);
    index++;

    if (/[.,!?]/.test(ch)) {
      clearInterval(timer);
      setTimeout(typewriter, 260);
    }
  }, speed);
}
typewriter();

/* ==========================================================
   NEXT BUTTON
========================================================== */

nextEl.addEventListener("click", () => {
  console.log("Phase 1 finished → go to Phase 2");
});
