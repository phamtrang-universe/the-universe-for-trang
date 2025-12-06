/* ==========================================================
   Universe for Trang — Scorpius
   PHASE 1: 2D intro (canvas)
   PHASE 2: Cinematic 3D universe (Three.js)
========================================================== */

/* Debug check */
console.log("scripts.js loaded");

/* DOM references */
const introCanvas = document.getElementById("introCanvas");
const introCtx = introCanvas.getContext("2d");

const introUI = document.getElementById("introUI");
const screenFlash = document.getElementById("screenFlash");
const finalMessage = document.getElementById("finalMessage");
const universe3DContainer = document.getElementById("universe3D");

/* ==========================================================
   CONSTELLATION DATA (KHAI BÁO TRƯỚC)
========================================================== */

/* Scorpius constellation (normalized coordinates) */
const SCORPIUS_2D = [
  { x: 0.32, y: 0.22 },
  { x: 0.42, y: 0.32 },
  { x: 0.51, y: 0.40 },
  { x: 0.55, y: 0.50 },
  { x: 0.48, y: 0.62 },
  { x: 0.42, y: 0.75 },
  { x: 0.53, y: 0.83 }
];

let scorpiusPoints2D = [];

/* Starfield */
let stars = [];
const STAR_COUNT = 180;

/* ==========================================================
   2D HELPER FUNCTIONS
========================================================== */

function createStarfield() {
  stars = [];
  const width = introCanvas.clientWidth || window.innerWidth;
  const height = introCanvas.clientHeight || window.innerHeight;

  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      speedY: 0.15 + Math.random() * 0.35,
      baseSize: 0.6 + Math.random() * 1.1,
      twinklePhase: Math.random() * Math.PI * 2
    });
  }
}

function convertConstellationPoints() {
  const width = introCanvas.clientWidth || window.innerWidth;
  const height = introCanvas.clientHeight || window.innerHeight;

  scorpiusPoints2D = SCORPIUS_2D.map(p => ({
    x: p.x * width,
    y: p.y * height
  }));
}

/* High-DPI handling for 2D canvas */
function resizeIntroCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const rect = introCanvas.getBoundingClientRect();

  introCanvas.width = rect.width * dpr;
  introCanvas.height = rect.height * dpr;

  introCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  convertConstellationPoints();
  createStarfield();
}

/* Vẽ nền sao */
function drawStarfield(time) {
  const width = introCanvas.clientWidth || window.innerWidth;
  const height = introCanvas.clientHeight || window.innerHeight;

  introCtx.save();
  introCtx.fillStyle = "rgba(2, 1, 24, 1)";
  introCtx.fillRect(0, 0, width, height);

  for (let s of stars) {
    s.y += s.speedY;
    if (s.y > height + 10) s.y = -10;

    const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(time * 0.0015 + s.twinklePhase));
    const radius = s.baseSize * twinkle;

    introCtx.beginPath();
    introCtx.fillStyle = "rgba(255,255,255,0.85)";
    introCtx.arc(s.x, s.y, radius, 0, Math.PI * 2);
    introCtx.fill();
  }

  introCtx.restore();
}

/* Vẽ chòm sao Scorpius */
function drawScorpius(time) {
  if (!scorpiusPoints2D.length) return;

  const points = scorpiusPoints2D;

  // Draw all stars (points)
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const isNext = introStarted && !introFinished && i === currentSegmentIndex;

    const glowRadius = isNext ? 18 : 14;
    const coreRadius = isNext ? 6.5 : 5.2;

    // Outer glow
    introCtx.beginPath();
    introCtx.fillStyle = "rgba(255,255,255," + (isNext ? 0.5 : 0.28) + ")";
    introCtx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
    introCtx.fill();

    // Inner core
    introCtx.beginPath();
    introCtx.fillStyle = "rgba(255,255,255,1)";
    introCtx.arc(p.x, p.y, coreRadius, 0, Math.PI * 2);
    introCtx.fill();
  }

  // Lines
  introCtx.lineWidth = 2;
  introCtx.strokeStyle = "rgba(255,255,255,0.98)";
  introCtx.beginPath();

  // Fully drawn segments
  if (introStarted) {
    for (let i = 0; i < currentSegmentIndex; i++) {
      const a = points[i];
      const b = points[i + 1];
      introCtx.moveTo(a.x, a.y);
      introCtx.lineTo(b.x, b.y);
    }

    // Current active segment (partial)
    if (!introFinished && currentSegmentIndex < points.length - 1) {
      const a = points[currentSegmentIndex];
      const b = points[currentSegmentIndex + 1];

      introCtx.moveTo(a.x, a.y);
      introCtx.lineTo(
        a.x + (b.x - a.x) * segmentProgress,
        a.y + (b.y - a.y) * segmentProgress
      );
    }
  }

  introCtx.stroke();
}

/* ==========================================================
   PHASE 1 STATE + EVENT
========================================================== */

let introRunning = true;
let introStarted = false;
let introFinished = false;

let currentSegmentIndex = 0; // segment between point[i] và point[i+1]
let segmentProgress = 0;     // 0 → 1
const SEGMENT_DURATION = 650; // ms per segment

/* Tap: bắt đầu auto-connect */
function onIntroTap(e) {
  if (introStarted || introFinished) return;

  const rect = introCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  // Chỉ start nếu chạm gần 1 ngôi sao
  const threshold = 40;
  let nearStar = false;
  for (let p of scorpiusPoints2D) {
    const dist = Math.hypot(x - p.x, y - p.y);
    if (dist < threshold) {
      nearStar = true;
      break;
    }
  }

  if (!nearStar) return;

  introStarted = true;

  // Fading hint text
  if (introUI) {
    introUI.style.opacity = "0.15";
  }
}

introCanvas.addEventListener("pointerdown", onIntroTap);

/* Intro animation loop */
let lastTime = performance.now();

function animateIntro(now) {
  if (!introRunning) return;

  const delta = now - lastTime;
  lastTime = now;

  drawStarfield(now);

  // Update line animation if started
  if (introStarted && !introFinished && scorpiusPoints2D.length > 1) {
    segmentProgress += delta / SEGMENT_DURATION;

    if (segmentProgress >= 1) {
      currentSegmentIndex++;
      segmentProgress = 0;

      if (currentSegmentIndex >= scorpiusPoints2D.length - 1) {
        introFinished = true;
        introStarted = false;
        setTimeout(() => {
          startTransitionTo3D();
        }, 450);
      }
    }
  }

  // Draw constellation
  drawScorpius(now);

  requestAnimationFrame(animateIntro);
}

/* Khởi động intro sau khi đã khai báo xong mọi thứ */
window.addEventListener("resize", resizeIntroCanvas);
resizeIntroCanvas();
requestAnimationFrame(animateIntro);

/* ==========================================================
   TRANSITION: 2D → 3D
========================================================== */

let universeInitialized = false;

function startTransitionTo3D() {
  if (universeInitialized) return;
  universeInitialized = true;

  // Stop intro canvas animation on next frame
  introRunning = false;

  // Fade out intro UI
  if (introUI) {
    introUI.classList.add("fade-out");
  }

  // Flash effect
  setTimeout(() => {
    screenFlash.style.opacity = "1";
  }, 150);

  // Hide 2D canvas, reveal 3D container
  setTimeout(() => {
    introCanvas.style.opacity = "0";
    introCanvas.style.pointerEvents = "none";

    initUniverse3D();
    universe3DContainer.style.opacity = "1";
  }, 450);

  // Fade flash away
  setTimeout(() => {
    screenFlash.style.opacity = "0";
  }, 900);

  // Final message fade-in
  setTimeout(() => {
    finalMessage.style.opacity = "1";
    finalMessage.setAttribute("aria-hidden", "false");
  }, 2600);
}

/* ==========================================================
   PHASE 2: THREE.JS UNIVERSE
========================================================== */

let scene, camera, renderer;
let scorpiusGroup;
let stars3D;
let meteors = [];
let meteorSpawnTimer = 0;
let universeClock = null; // khởi tạo sau khi chắc chắn THREE tồn tại

/* Initialize Three.js scene */
function initUniverse3D() {
  if (typeof THREE === "undefined") {
    console.error("Three.js failed to load. 3D phase will not run.");
    return;
  }

  const width = universe3DContainer.clientWidth;
  const height = universe3DContainer.clientHeight || window.innerHeight;

  scene = new THREE.Scene();
  universeClock = new THREE.Clock();

  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
  camera.position.set(0, 10, 70);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
  });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setClearColor(0x020118, 1);

  universe3DContainer.appendChild(renderer.domElement);

  // Soft ambient light
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xfff3dd, 0.7);
  dirLight.position.set(40, 60, 30);
  scene.add(dirLight);

  create3DStarfield();
  createScorpius3D();
  animateUniverse();
  window.addEventListener("resize", onUniverseResize);
}

/* Handle window resize for 3D */
function onUniverseResize() {
  if (!renderer || !camera) return;

  const width = universe3DContainer.clientWidth;
  const height = universe3DContainer.clientHeight || window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height, false);
}

/* 3D starfield */
function create3DStarfield() {
  const starCount = 1400;
  const positions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    positions[i3 + 0] = (Math.random() - 0.5) * 500;
    positions[i3 + 1] = (Math.random() - 0.5) * 300;
    positions[i3 + 2] = (Math.random() - 0.5) * 500;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.2,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85
  });

  stars3D = new THREE.Points(geometry, material);
  scene.add(stars3D);
}

/* Scorpius constellation in 3D */
function createScorpius3D() {
  scorpiusGroup = new THREE.Group();

  // Artistic 3D layout of Scorpius (x, y, z)
  const scorpiusPositions = [
    new THREE.Vector3(-15, 15, 0),
    new THREE.Vector3(-5, 8, 5),
    new THREE.Vector3(4, 4, 2),
    new THREE.Vector3(10, -2, 0),
    new THREE.Vector3(5, -10, -3),
    new THREE.Vector3(-2, -18, -6),
    new THREE.Vector3(8, -25, -4)
  ];

  const starMaterial = new THREE.MeshBasicMaterial({
    color: 0xfff5cf
  });

  const starGeometry = new THREE.SphereGeometry(1.2, 16, 16);

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xfff5cf,
    linewidth: 2
  });

  const linePoints = [];

  // Create star spheres
  scorpiusPositions.forEach(pos => {
    const star = new THREE.Mesh(starGeometry, starMaterial.clone());
    star.position.copy(pos);
    scorpiusGroup.add(star);
    linePoints.push(pos.clone());
  });

  // Connecting line
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
  const line = new THREE.Line(lineGeometry, lineMaterial);
  scorpiusGroup.add(line);

  // Initial tilt (base orientation)
  scorpiusGroup.rotation.x = THREE.MathUtils.degToRad(-18);

  scene.add(scorpiusGroup);
}

/* Meteors */
function spawnMeteor() {
  const meteorGeometry = new THREE.SphereGeometry(0.7, 12, 12);
  const meteorMaterial = new THREE.MeshBasicMaterial({
    color: 0x9ad7ff
  });

  const meteor = new THREE.Mesh(meteorGeometry, meteorMaterial);

  // Start from top-left-ish, move towards bottom-right-ish
  meteor.position.set(
    -120 + Math.random() * 40,
    60 + Math.random() * 20,
    -40 + Math.random() * 40
  );

  const speed = 40 + Math.random() * 25;
  const dir = new THREE.Vector3(1, -0.4, 0.2).normalize().multiplyScalar(speed);

  meteors.push({
    mesh: meteor,
    velocity: dir,
    life: 0,
    maxLife: 2.0 + Math.random() * 0.8
  });

  scene.add(meteor);
}

/* Universe animation loop */
function animateUniverse() {
  if (!universeClock || !renderer || !scene || !camera) return;

  const elapsed = universeClock.getElapsedTime();
  const delta = universeClock.getDelta();

  requestAnimationFrame(animateUniverse);

  // Camera subtle orbit
  const radius = 75;
  const camAngle = elapsed * 0.07;
  camera.position.x = Math.cos(camAngle) * radius;
  camera.position.z = Math.sin(camAngle) * radius;
  camera.lookAt(0, 0, 0);

  // Twinkle starfield by modulating opacity
  if (stars3D && stars3D.material) {
    const base = 0.65;
    const swing = 0.2;
    stars3D.material.opacity = base + swing * Math.sin(elapsed * 0.7);
  }

  // Scorpius: almost static base pose + gentle wobble + soft glow (mix 1, 2, 3)
  if (scorpiusGroup) {
    // Base angles so it feels posed
    const baseRotY = THREE.MathUtils.degToRad(-8);
    const baseRotX = THREE.MathUtils.degToRad(-18);

    // Tiny breathing motion, not a full spin
    const wobbleY = Math.sin(elapsed * 0.25) * THREE.MathUtils.degToRad(4);  // ±4°
    const wobbleX = Math.sin(elapsed * 0.18 + 1.2) * THREE.MathUtils.degToRad(2); // ±2°

    scorpiusGroup.rotation.y = baseRotY + wobbleY;
    scorpiusGroup.rotation.x = baseRotX + wobbleX;

    // Soft glow pulsing on all stars
    scorpiusGroup.children.forEach(obj => {
      if (obj.isMesh) {
        const pulse = 0.6 + 0.4 * Math.sin(elapsed * 1.4);
        const baseColor = new THREE.Color(0xfff5cf);
        const brightened = baseColor.clone().multiplyScalar(0.9 + 0.5 * pulse);
        obj.material.color.copy(brightened);
      }
    });
  }

  // Meteors update
  meteorSpawnTimer += delta;
  if (meteorSpawnTimer > 3.5 + Math.random() * 2.5) {
    meteorSpawnTimer = 0;
    spawnMeteor();
  }

  meteors = meteors.filter(m => {
    m.life += delta;
    const t = delta;

    m.mesh.position.x += m.velocity.x * t;
    m.mesh.position.y += m.velocity.y * t;
    m.mesh.position.z += m.velocity.z * t;

    // Fade meteor over lifetime
    const fade = 1 - m.life / m.maxLife;
    if (fade <= 0 || m.mesh.position.length() > 250) {
      scene.remove(m.mesh);
      return false;
    } else {
      if (m.mesh.material && m.mesh.material.color) {
        const alpha = 0.4 + 0.6 * fade;
        const baseColor = new THREE.Color(0x9ad7ff);
        m.mesh.material.color.copy(baseColor.multiplyScalar(alpha + 0.3));
      }
      return true;
    }
  });

  renderer.render(scene, camera);
}
