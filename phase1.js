/* ==========================================================
   Universe for Trang — Phase 1
   High-end 2D cinematic space:
   - Deep gradient background
   - Moving nebula
   - Layered starfield
   - Typewriter text + next arrow
========================================================== */

/* ---------- DOM references ---------- */
const canvas = document.getElementById("phase1Background");
const ctx = canvas.getContext("2d");

const textEl = document.getElementById("phase1Text");
const nextBtn = document.getElementById("phase1Next");

/* ---------- Resize canvas (HiDPI) ---------- */
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ==========================================================
   STARFIELD + NEBULA BACKGROUND
========================================================== */

const FAR_STAR_COUNT = 260;
const NEAR_STAR_COUNT = 120;
let farStars = [];
let nearStars = [];

/* Initialize star layers */
function initStars() {
  farStars = [];
  nearStars = [];

  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;

  for (let i = 0; i < FAR_STAR_COUNT; i++) {
    farStars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      baseRadius: 0.5 + Math.random() * 0.8,
      twinklePhase: Math.random() * Math.PI * 2,
      driftY: 0.02 + Math.random() * 0.08
    });
  }

  for (let i = 0; i < NEAR_STAR_COUNT; i++) {
    nearStars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      baseRadius: 0.9 + Math.random() * 1.4,
      twinklePhase: Math.random() * Math.PI * 2,
      driftY: 0.03 + Math.random() * 0.12
    });
  }
}
initStars();

/* Draw animated background: gradient + nebula + stars */
function drawBackground(time) {
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;

  /* 1) Deep vertical gradient base */
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#05031f");
  g.addColorStop(0.35, "#05041e");
  g.addColorStop(0.7, "#030117");
  g.addColorStop(1, "#020013");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  /* 2) Nebula layers (soft, moving) */
  const t = time * 0.001;

  function nebula(cx, cy, baseR, colorStops, offsetX, offsetY, pulseSpeed) {
    const pulse = 0.85 + 0.25 * Math.sin(t * pulseSpeed);
    const r = baseR * pulse;

    const x = cx + offsetX * Math.cos(t * 0.15);
    const y = cy + offsetY * Math.sin(t * 0.12);

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    colorStops.forEach(stop => {
      grad.addColorStop(stop.offset, stop.color);
    });
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Main violet nebula
  nebula(
    w * 0.3, h * 0.4, Math.max(w, h) * 0.7,
    [
      { offset: 0.0, color: "rgba(190,160,255,0.45)" },
      { offset: 0.4, color: "rgba(110,90,220,0.35)" },
      { offset: 1.0, color: "rgba(5,3,30,0.0)" }
    ],
    18, 12, 0.35
  );

  // Teal nebula
  nebula(
    w * 0.75, h * 0.25, Math.max(w, h) * 0.6,
    [
      { offset: 0.0, color: "rgba(145,230,255,0.40)" },
      { offset: 0.5, color: "rgba(60,150,200,0.32)" },
      { offset: 1.0, color: "rgba(5,8,25,0.0)" }
    ],
    -22, 16, 0.28
  );

  // Magenta glow near center
  nebula(
    w * 0.55, h * 0.62, Math.max(w, h) * 0.5,
    [
      { offset: 0.0, color: "rgba(255,160,230,0.38)" },
      { offset: 0.4, color: "rgba(180,90,180,0.28)" },
      { offset: 1.0, color: "rgba(5,3,20,0.0)" }
    ],
    10, -18, 0.42
  );

  /* 3) Far stars (tiny, soft) */
  ctx.save();
  ctx.globalAlpha = 0.9;
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

  /* 4) Near stars (brighter, slightly bigger) */
  ctx.save();
  for (let s of nearStars) {
    s.y += s.driftY;
    if (s.y > h + 6) s.y = -6;

    const tw = 0.6 + 0.4 * Math.abs(Math.sin(time * 0.0016 + s.twinklePhase));
    const r = s.baseRadius * tw;

    // core
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fill();

    // soft halo
    const haloR = r * 3.5;
    const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, haloR);
    grad.addColorStop(0, "rgba(255,255,255,0.35)");
    grad.addColorStop(1, "rgba(255,255,255,0.0)");
    ctx.fillStyle = grad;
    ctx.fillRect(s.x - haloR, s.y - haloR, haloR * 2, haloR * 2);
  }
  ctx.restore();
}

/* Animation loop for background */
function animateBackground(time) {
  drawBackground(time);
  requestAnimationFrame(animateBackground);
}
requestAnimationFrame(animateBackground);

/* ==========================================================
   PHASE 1 TEXT: TYPEWRITER
========================================================== */

const phase1Line =
  "Before the universe says anything, it just quietly breathes in the dark.";

let typingIndex = 0;
let typingTimer = null;
let isTyping = false;

function startPhase1Text() {
  if (typingTimer) clearInterval(typingTimer);
  textEl.textContent = "";
  typingIndex = 0;
  isTyping = true;

  nextBtn.classList.remove("visible");
  nextBtn.style.pointerEvents = "none";

  const baseSpeed = 42;    // ms per character
  const punctPause = 260;  // pause after punctuation

  function step() {
    if (typingIndex > phase1Line.length) {
      clearInterval(typingTimer);
      isTyping = false;

      setTimeout(() => {
        nextBtn.classList.add("visible");
        nextBtn.style.pointerEvents = "auto";
      }, 350);
      return;
    }

    const ch = phase1Line.charAt(typingIndex);
    textEl.textContent = phase1Line.slice(0, typingIndex + 1);
    typingIndex++;

    if (/[.,!?]/.test(ch)) {
      clearInterval(typingTimer);
      typingTimer = setInterval(step, punctPause);
    }
  }

  typingTimer = setInterval(step, baseSpeed);
}

/* Clicking next during typing: skip to full text */
nextBtn.addEventListener("click", () => {
  // Nếu vẫn đang gõ thì skip cho hiện full text đã
  if (isTyping) {
    if (typingTimer) clearInterval(typingTimer);
    textEl.textContent = phase1Line;
    isTyping = false;

    setTimeout(() => {
      nextBtn.classList.add("visible");
      nextBtn.style.pointerEvents = "auto";
    }, 150);
    return;
  }

  // Khi gõ xong và người dùng bấm mũi tên → sang Phase 2
  window.location.href = "phase2.html";
});
/* Also allow tapping text to trigger next when arrow is visible */
textEl.addEventListener("click", () => {
  if (!isTyping && nextBtn.classList.contains("visible")) {
    nextBtn.click();
  }
});

/* Start Phase 1 text on load */
startPhase1Text();
