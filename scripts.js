/* ==========================================================
   Universe for Trang – 3 phases in 1 page
   Phase 1: Nebula + starfield + romantic line 1
   Phase 2: Interactive – tap stars to draw Scorpius + line 2
   Phase 3: Scorpius in motion + meteors + climax line 3
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
window.addEventListener("resize", () => {
  resizeCanvas();
  convertConstellationPoints();
  initStars();
});

/* ==========================================================
   STARFIELD + NEBULA (shared for all phases)
========================================================== */

const FAR_STAR_COUNT = 260;
const NEAR_STAR_COUNT = 120;
let farStars = [];
let nearStars = [];

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

function drawBackground(time) {
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;

  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#05031f");
  g.addColorStop(0.35, "#05041e");
  g.addColorStop(0.7, "#030117");
  g.addColorStop(1, "#020013");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const t = time * 0.001;

  function nebula(cx, cy, baseR, colorStops, offsetX, offsetY, pulseSpeed) {
    const pulse = 0.85 + 0.25 * Math.sin(t * pulseSpeed);
    const r = baseR * pulse;

    const x = cx + offsetX * Math.cos(t * 0.15);
    const y = cy + offsetY * Math.sin(t * 0.12);

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    colorStops.forEach(stop => grad.addColorStop(stop.offset, stop.color));
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }

  const maxDim = Math.max(w, h);

  nebula(
    w * 0.3, h * 0.4, maxDim * 0.7,
    [
      { offset: 0.0, color: "rgba(190,160,255,0.45)" },
      { offset: 0.4, color: "rgba(110,90,220,0.35)" },
      { offset: 1.0, color: "rgba(5,3,30,0.0)" }
    ],
    18, 12, 0.35
  );

  nebula(
    w * 0.75, h * 0.25, maxDim * 0.6,
    [
      { offset: 0.0, color: "rgba(145,230,255,0.40)" },
      { offset: 0.5, color: "rgba(60,150,200,0.32)" },
      { offset: 1.0, color: "rgba(5,8,25,0.0)" }
    ],
    -22, 16, 0.28
  );

  nebula(
    w * 0.55, h * 0.62, maxDim * 0.5,
    [
      { offset: 0.0, color: "rgba(255,160,230,0.38)" },
      { offset: 0.4, color: "rgba(180,90,180,0.28)" },
      { offset: 1.0, color: "rgba(5,3,20,0.0)" }
    ],
    10, -18, 0.42
  );

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

  ctx.save();
  for (let s of nearStars) {
    s.y += s.driftY;
    if (s.y > h + 6) s.y = -6;

    const tw = 0.6 + 0.4 * Math.abs(Math.sin(time * 0.0016 + s.twinklePhase));
    const r = s.baseRadius * tw;

    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fill();

    const haloR = r * 3.5;
    const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, haloR);
    grad.addColorStop(0, "rgba(255,255,255,0.35)");
    grad.addColorStop(1, "rgba(255,255,255,0.0)");
    ctx.fillStyle = grad;
    ctx.fillRect(s.x - haloR, s.y - haloR, haloR * 2, haloR * 2);
  }
  ctx.restore();
}

/* ==========================================================
   CONSTELLATION – Scorpius
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

let basePts = [];
let centroid = { x: 0, y: 0 };

function convertConstellationPoints() {
  const w = canvas.clientWidth || window.innerWidth;
  const h = canvas.clientHeight || window.innerHeight;

  // đẩy chòm sao lệch sang trái một chút để không trùng trục giữa
  basePts = SCORPIUS.map(p => {
    const nx = (p.x - 0.5) * 0.8 + 0.38; // scale + shift left
    return {
      x: nx * w,
      y: p.y * h
    };
  });

  let sx = 0, sy = 0;
  basePts.forEach(p => {
    sx += p.x;
    sy += p.y;
  });
  centroid.x = sx / basePts.length;
  centroid.y = sy / basePts.length;
}
convertConstellationPoints();

/* Phase 2 – interactive tap progress */
let tapProgress = 0;       // số sao đã chạm đúng
let interactiveDone = false;

/* Phase 2 & 3 share these helpers */

function drawScorpiusRevealInteractive(time) {
  const pts = basePts;
  const t = time * 0.001;

  const revealed = tapProgress; // số điểm đã mở

  const maxR = (canvas.clientWidth || window.innerWidth) * 0.24;
  const pulse = 0.8 + 0.2 * Math.sin(t * 1.6);
  const r = maxR * pulse;

  const grad = ctx.createRadialGradient(centroid.x, centroid.y, 0, centroid.x, centroid.y, r);
  grad.addColorStop(0, "rgba(160,200,255,0.25)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(centroid.x - r, centroid.y - r, r * 2, r * 2);

  // lines theo tiến độ chạm
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();

  const p = revealed;
  for (let i = 0; i < pts.length - 1; i++) {
    if (i + 1 <= p) {
      ctx.moveTo(pts[i].x, pts[i].y);
      if (i + 1 < p) {
        ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
      } else {
        const k = Math.min(1, p - i);
        const x = pts[i].x + (pts[i + 1].x - pts[i].x) * k;
        const y = pts[i].y + (pts[i + 1].y - pts[i].y) * k;
        ctx.lineTo(x, y);
      }
    }
  }
  ctx.stroke();

  // stars: những sao đã chạm + sao kế tiếp sẽ glow mạnh hơn
  pts.forEach((pt, i) => {
    let strength = 0.2;
    if (i < tapProgress) strength = 1;
    else if (i === tapProgress) strength = 0.6;

    const pulseStar = 0.6 + 0.4 * Math.sin(t * 2 + i);
    const size = 4 + pulseStar * 3 * strength;

    ctx.beginPath();
    ctx.fillStyle = `rgba(255,255,255,${0.16 * strength})`;
    ctx.arc(pt.x, pt.y, size * 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.97)";
    ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
    ctx.fill();
  });
}

/* Phase 3 – rotation + meteors */

function rotatedPoints(time) {
  const t = time * 0.001;
  const angle = 0.08 * Math.sin(t * 0.4);
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

let meteors = [];
let lastMeteorTime = 0;

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

function drawMeteors(delta) {
  const now = performance.now();

  if (now - lastMeteorTime > 2600 + Math.random() * 1800) {
    spawnMeteor();
    lastMeteorTime = now;
  }

  meteors = meteors.filter(m => {
    m.life += delta;
    m.x += m.vx * (delta * 0.06);
    m.y += m.vy * (delta * 0.06);

    const lifeRatio = 1 - m.life / m.maxLife;
    if (lifeRatio <= 0) return false;

    ctx.save();

    ctx.globalAlpha = 0.35 * lifeRatio;
    ctx.strokeStyle = "rgba(180,220,255,0.9)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(m.x - 40, m.y - 20);
    ctx.lineTo(m.x, m.y);
    ctx.stroke();

    ctx.globalAlpha = 0.7 * lifeRatio;
    ctx.beginPath();
    ctx.fillStyle = "#ffffff";
    ctx.arc(m.x, m.y, 2.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    return true;
  });
}

function drawScorpiusMotion(time, delta) {
  const pts = rotatedPoints(time);
  const t = time * 0.001;

  const maxR = (canvas.clientWidth || window.innerWidth) * 0.28;
  const pulse = 0.9 + 0.1 * Math.sin(t * 1.4);
  const r = maxR * pulse;

  const grad = ctx.createRadialGradient(centroid.x, centroid.y, 0, centroid.x, centroid.y, r);
  grad.addColorStop(0, "rgba(200,220,255,0.3)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(centroid.x - r, centroid.y - r, r * 2, r * 2);

  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < pts.length - 1; i++) {
    ctx.moveTo(pts[i].x, pts[i].y);
    ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
  }
  ctx.stroke();

  pts.forEach((p, i) => {
    const pulseStar = 0.6 + 0.4 * Math.sin(t * 2 + i);
    const size = 4 + pulseStar * 3;

    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.arc(p.x, p.y, size * 2.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.98)";
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  });

  drawMeteors(delta);
}

/* ==========================================================
   PHASE STATE + TEXT
========================================================== */

let currentPhase = 1;

// text cho từng phase
const phaseLines = [
  "Tonight the universe is quiet, breathing softly in the dark.",
  "Touch each glowing star to trace the shape of Scorpius.",
  "Now all of Scorpius turns for you alone, in a sky that never runs out of stars."
];

// câu thay thế sau khi vẽ xong chòm sao
const phase2CompletedLine =
  "Every line you drew here is a tiny orbit, circling quietly around you.";

let typingIndex = 0;
let typingTimer = null;
let isTyping = false;

function startPhaseText(phase) {
  if (typingTimer) clearInterval(typingTimer);
  const line = phaseLines[phase - 1];

  textEl.textContent = "";
  typingIndex = 0;
  isTyping = true;

  nextBtn.classList.remove("visible");
  nextBtn.style.pointerEvents = "none";

  const baseSpeed = 42;
  const punctPause = 260;

  function step() {
    if (typingIndex > line.length) {
      clearInterval(typingTimer);
      isTyping = false;

      // Phase 2: không hiện mũi tên ngay,
      // chỉ hiện sau khi người dùng nối xong chòm sao
      if (phase !== 2) {
        setTimeout(() => {
          nextBtn.classList.add("visible");
          nextBtn.style.pointerEvents = "auto";
        }, 350);
      }
      return;
    }

    const ch = line.charAt(typingIndex);
    textEl.textContent = line.slice(0, typingIndex + 1);
    typingIndex++;

    if (/[.,!?]/.test(ch)) {
      clearInterval(typingTimer);
      typingTimer = setInterval(step, punctPause);
    }
  }

  typingTimer = setInterval(step, baseSpeed);
}

/* chuyển phase khi bấm mũi tên */
function goToNextPhase() {
  if (isTyping) {
    // skip typing → hiện full câu
    if (typingTimer) clearInterval(typingTimer);
    textEl.textContent = phaseLines[currentPhase - 1];
    isTyping = false;

    if (currentPhase !== 2) {
      setTimeout(() => {
        nextBtn.classList.add("visible");
        nextBtn.style.pointerEvents = "auto";
      }, 150);
    }
    return;
  }

  if (currentPhase < 3) {
    currentPhase++;

    if (currentPhase === 2) {
      tapProgress = 0;
      interactiveDone = false;
    }
    if (currentPhase === 3) {
      meteors = [];
      lastMeteorTime = performance.now();
    }

    startPhaseText(currentPhase);
  } else {
    console.log("All 3 phases completed.");
    nextBtn.classList.remove("visible");
    nextBtn.style.pointerEvents = "none";
  }
}

nextBtn.addEventListener("click", goToNextPhase);
textEl.addEventListener("click", () => {
  if (!isTyping && nextBtn.classList.contains("visible")) {
    goToNextPhase();
  }
});

/* ==========================================================
   PHASE 2 – TAP HANDLER
========================================================== */

canvas.addEventListener("pointerdown", e => {
  if (currentPhase !== 2 || interactiveDone) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const target = basePts[tapProgress];
  const dist = Math.hypot(x - target.x, y - target.y);

  const threshold = 32;
  if (dist < threshold) {
    tapProgress++;

    if (tapProgress >= basePts.length) {
      interactiveDone = true;

      // đổi text phase 2 sang câu lãng mạn hơn
      textEl.textContent = "";
      let i = 0;
      const line = phase2CompletedLine;
      function typeCompleted() {
        if (i <= line.length) {
          textEl.textContent = line.slice(0, i + 1);
          i++;
          setTimeout(typeCompleted, 42);
        } else {
          setTimeout(() => {
            nextBtn.classList.add("visible");
            nextBtn.style.pointerEvents = "auto";
          }, 350);
        }
      }
      typeCompleted();
    }
  }
});

/* ==========================================================
   MAIN ANIMATION LOOP
========================================================== */

let lastTime = performance.now();

function animate(time) {
  const delta = time - lastTime;
  lastTime = time;

  drawBackground(time);

  if (currentPhase === 2) {
    drawScorpiusRevealInteractive(time);
  } else if (currentPhase === 3) {
    drawScorpiusMotion(time, delta);
  }

  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

/* Start Phase 1 text on load */
startPhaseText(currentPhase);
