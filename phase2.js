/* ==========================================================
   Phase 2 — Scorpius in Motion
   - Deep nebula background
   - Starfield twinkling
   - Scorpius fully formed, gently rotating
   - Soft aura + tiny meteors behind
   - Typewriter text + glass arrow
========================================================== */

const canvas = document.getElementById("p2Canvas");
const ctx = canvas.getContext("2d");

const textEl = document.getElementById("p2Text");
const nextEl = document.getElementById("p2Next");

/* ---------- Resize ---------- */
function resize() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
window.addEventListener("resize", () => {
  resize();
  convertPoints();
  initStars();
});

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

let basePts = [];   // fixed coordinates
let centroid = { x: 0, y: 0 };

function convertPoints() {
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;

  basePts = SCORPIUS.map(p => ({
    x: p.x * w,
    y: p.y * h
  }));

  // compute centroid
  let sx = 0, sy = 0;
  basePts.forEach(p => {
    sx += p.x;
    sy += p.y;
  });
  centroid.x = sx / basePts.length;
  centroid.y = sy / basePts.length;
}
convertPoints();

/* ==========================================================
   STARFIELD & NEBULA
========================================================== */

let farStars = [];
let nearStars = [];
const FAR_COUNT = 260;
const NEAR_COUNT = 120;

function initStars() {
  farStars = [];
  nearStars = [];

  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;

  for (let i = 0; i < FAR_COUNT; i++) {
    farStars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      baseRadius: 0.5 + Math.random() * 0.7,
      twinklePhase: Math.random() * Math.PI * 2,
      driftY: 0.02 + Math.random() * 0.05
    });
  }

  for (let i = 0; i < NEAR_COUNT; i++) {
    nearStars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      baseRadius: 0.9 + Math.random() * 1.2,
      twinklePhase: Math.random() * Math.PI * 2,
      driftY: 0.04 + Math.random() * 0.09
    });
  }
}
initStars();

function drawBackground(time) {
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;

  // Deep gradient
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#050320");
  g.addColorStop(0.4, "#04021a");
  g.addColorStop(1, "#020013");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const t = time * 0.001;

  // Nebula helper
  function nebula(cx, cy, baseR, stops, offsetX, offsetY, speed) {
    const pulse = 0.85 + 0.2 * Math.sin(t * speed);
    const r = baseR * pulse;

    const x = cx + offsetX * Math.cos(t * 0.18);
    const y = cy + offsetY * Math.sin(t * 0.14);

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    stops.forEach(s => grad.addColorStop(s.offset, s.color));

    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  const maxDim = Math.max(w, h);

  // Violet cloud
  nebula(
    w * 0.25, h * 0.35, maxDim * 0.75,
    [
      { offset: 0, color: "rgba(190,160,255,0.45)" },
      { offset: 0.45, color: "rgba(120,90,220,0.36)" },
      { offset: 1, color: "rgba(3,2,20,0)" }
    ],
    20, 12, 0.35
  );

  // Teal cloud
  nebula(
    w * 0.78, h * 0.25, maxDim * 0.65,
    [
      { offset: 0, color: "rgba(145,230,255,0.40)" },
      { offset: 0.5, color: "rgba(60,150,200,0.3)" },
      { offset: 1, color: "rgba(2,4,20,0)" }
    ],
    -22, 14, 0.28
  );

  // Magenta center glow
  nebula(
    w * 0.55, h * 0.6, maxDim * 0.55,
    [
      { offset: 0, color: "rgba(255,160,230,0.38)" },
      { offset: 0.5, color: "rgba(180,90,180,0.28)" },
      { offset: 1, color: "rgba(3,2,20,0)" }
    ],
    10, -18, 0.42
  );

  // Far stars
  ctx.save();
  for (let s of farStars) {
    s.y += s.driftY;
    if (s.y > h + 4) s.y = -4;

    const tw = 0.4 + 0.6 * Math.abs(Math.sin(time * 0.0013 + s.twinklePhase));
    const r = s.baseRadius * tw;

    ctx.beginPath();
    ctx.fillStyle = "rgba(230,230,255,0.9)";
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Near stars
  ctx.save();
  for (let s of nearStars) {
    s.y += s.driftY;
    if (s.y > h + 6) s.y = -6;

    const tw = 0.6 + 0.4 * Math.abs(Math.sin(time * 0.0017 + s.twinklePhase));
    const r = s.baseRadius * tw;

    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fill();

    const haloR = r * 3;
    const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, haloR);
    grad.addColorStop(0, "rgba(255,255,255,0.32)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(s.x - haloR, s.y - haloR, haloR * 2, haloR * 2);
  }
  ctx.restore();
}

/* ==========================================================
   SCORPIUS IN MOTION
========================================================== */

function getRotatedPoints(time) {
  const t = time * 0.001;
  const angle = 0.08 * Math.sin(t * 0.4); // gentle rocking

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return basePts.map(p => {
    const dx = p.x - centroid.x;
    const dy = p.y - centroid.y;

    return {
      x: centroid.x + dx * cos - dy * sin,
      y: centroid.y + dx * sin + dy * cos
    };
  });
}

function drawScorpius(time) {
  if (!basePts.length) return;

  const pts = getRotatedPoints(time);
  const t = time * 0.001;

  // Aura
  const c = centroid;
  const maxR = (canvas.clientWidth || window.innerWidth) * 0.28;
  const pulse = 0.9 + 0.1 * Math.sin(t * 1.4);
  const r = maxR * pulse;

  const grad = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
  grad.addColorStop(0, "rgba(160,200,255,0.25)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(c.x - r, c.y - r, r * 2, r * 2);

  // Lines
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  for (let i = 0; i < pts.length - 1; i++) {
    ctx.moveTo(pts[i].x, pts[i].y);
    ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
  }
  ctx.stroke();

  // Stars
  pts.forEach((p, i) => {
    const pulseStar = 0.6 + 0.4 * Math.sin(t * 2 + i);
    const size = 4 + pulseStar * 3;

    // Glow
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.arc(p.x, p.y, size * 2.4, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.97)";
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  });
}

/* ==========================================================
   METEORS (BEHIND CONSTELLATION)
========================================================== */

let meteors = [];

function spawnMeteor() {
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;

  meteors.push({
    x: -40,
    y: 40 + Math.random() * (h * 0.3),
    vx: 0.8 + Math.random() * 1.4,
    vy: 0.2 + Math.random() * 0.4,
    life: 0,
    maxLife: 2000 + Math.random() * 1200
  });
}

let lastMeteorTime = 0;

function drawMeteors(delta) {
  const now = performance.now();

  if (now - lastMeteorTime > 2800 + Math.random() * 1800) {
    spawnMeteor();
    lastMeteorTime = now;
  }

  meteors = meteors.filter(m => {
    m.life += delta;
    m.x += m.vx * (delta * 0.06);
    m.y += m.vy * (delta * 0.06);

    const lifeRatio = 1 - m.life / m.maxLife;
    if (lifeRatio <= 0) return false;

    // Tail
    ctx.save();
    ctx.globalAlpha = 0.35 * lifeRatio;
    ctx.strokeStyle = "rgba(180,220,255,0.9)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(m.x - 40, m.y - 20);
    ctx.lineTo(m.x, m.y);
    ctx.stroke();

    // Head
    ctx.globalAlpha = 0.7 * lifeRatio;
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.arc(m.x, m.y, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    return true;
  });
}

/* ==========================================================
   MAIN LOOP
========================================================== */

let lastTime = performance.now();

function animate(time) {
  const delta = time - lastTime;
  lastTime = time;

  drawBackground(time);
  drawScorpius(time);
  drawMeteors(delta);

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

/* ==========================================================
   TYPEWRITER TEXT
========================================================== */

const line =
  "Now your Scorpius is fully awake, quietly turning in the middle of its own galaxy.";

let index = 0;
let typingDone = false;

function startTyping() {
  const baseSpeed = 42;

  function step() {
    if (index > line.length) {
      typingDone = true;
      return;
    }

    const ch = line[index];
    textEl.textContent = line.slice(0, index + 1);
    index++;

    const delay = /[.,!?]/.test(ch) ? 260 : baseSpeed;
    setTimeout(step, delay);
  }

  step();
}
startTyping();

/* ==========================================================
   NEXT BUTTON (placeholder hook to Phase 3)
========================================================== */

let nextVisible = false;
setTimeout(() => {
  nextVisible = true;
  nextEl.classList.add("visible");
}, 2600); // a bit after text starts

nextEl.addEventListener("click", () => {
  console.log("Phase 2 finished → go to Phase 3");
});
