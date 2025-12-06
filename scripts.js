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
   CONSTELLATION DATA (DECLARE FIRST)
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

/* Starfield (2D) */
let stars = [];
const STAR_COUNT = 180;

/* ==========================================================
   2D HELPERS
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

/* Draw 2D starfield */
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

/* Draw Scorpius (2D) */
function drawScorpius(time) {
  if (!scorpiusPoints2D.length) return;

  const points = scorpiusPoints2D;

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

  if (introStarted) {
    for (let i = 0; i < currentSegmentIndex; i++) {
      const a = points[i];
      const b = points[i + 1];
      introCtx.moveTo(a.x, a.y);
      introCtx.lineTo(b.x, b.y);
    }

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
   PHASE 1 STATE + EVENTS
========================================================== */

let introRunning = true;
let introStarted = false;
let introFinished = false;

let currentSegmentIndex = 0;
let segmentProgress = 0;
const SEGMENT_DURATION = 650; // ms per segment

function onIntroTap(e) {
  if (introStarted || introFinished) return;

  const rect = introCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

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
  if (introUI) introUI.style.opacity = "0.15";
}

introCanvas.addEventListener("pointerdown", onIntroTap);

let lastTime = performance.now();

function animateIntro(now) {
  if (!introRunning) return;

  const delta = now - lastTime;
  lastTime = now;

  drawStarfield(now);

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

  drawScorpius(now);

  requestAnimationFrame(animateIntro);
}

/* Setup 2D */
window.addEventListener("resize", resizeIntroCanvas);
resizeIntroCanvas();
requestAnimationFrame(animateIntro);

/* ==========================================================
   TRANSITION 2D → 3D
========================================================== */

let universeInitialized = false;

function startTransitionTo3D() {
  if (universeInitialized) return;
  universeInitialized = true;

  introRunning = false;

  if (introUI) introUI.classList.add("fade-out");

  setTimeout(() => {
    screenFlash.style.opacity = "1";
  }, 150);

  setTimeout(() => {
    introCanvas.style.opacity = "0";
    introCanvas.style.pointerEvents = "none";

    initUniverse3D();
    universe3DContainer.style.opacity = "1";
  }, 450);

  setTimeout(() => {
    screenFlash.style.opacity = "0";
  }, 900);

  setTimeout(() => {
    finalMessage.style.opacity = "1";
    finalMessage.setAttribute("aria-hidden", "false");
  }, 2600);
}

/* ==========================================================
   PHASE 2: THREE.JS CINEMATIC UNIVERSE
========================================================== */

let scene, camera, renderer;
let universeClock = null;

let starsFar, starsNear, dustSystem;
let nebulaGroup;
let scorpiusGroup;
let mainPlanet, planetRing, moon;
let comets = [];
let cometTimer = 0;

/* Small helper: create radial nebula texture with canvas */
function createNebulaTexture(colorInner, colorOuter) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const maxR = canvas.width / 2;

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
  grad.addColorStop(0, colorInner);
  grad.addColorStop(0.4, colorInner);
  grad.addColorStop(1, colorOuter);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

/* Init 3D universe */
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
  camera.position.set(0, 30, 110);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false
  });
  renderer.setSize(width, height, false);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setClearColor(0x020118, 1);

  universe3DContainer.appendChild(renderer.domElement);

  /* LIGHTS */
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xfff3dd, 0.9);
  keyLight.position.set(60, 80, 40);
  scene.add(keyLight);

  const scorch = new THREE.PointLight(0xfff0c0, 1.4, 200);
  scorch.position.set(0, 0, 0);
  scene.add(scorch);

  /* BACKGROUND */
  create3DStarfield();
  createNebulae();
  createPlanets();
  createScorpius3D();
  createSpaceDust();

  animateUniverse();
  window.addEventListener("resize", onUniverseResize);
}

/* Resize 3D */
function onUniverseResize() {
  if (!renderer || !camera) return;

  const width = universe3DContainer.clientWidth;
  const height = universe3DContainer.clientHeight || window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

/* Deep starfield: far + near layers */
function create3DStarfield() {
  // Far stars (tiny, very many)
  const farCount = 2800;
  const farPos = new Float32Array(farCount * 3);

  for (let i = 0; i < farCount; i++) {
    const i3 = i * 3;
    farPos[i3 + 0] = (Math.random() - 0.5) * 900;
    farPos[i3 + 1] = (Math.random() - 0.5) * 600;
    farPos[i3 + 2] = (Math.random() - 0.5) * 900;
  }

  const farGeo = new THREE.BufferGeometry();
  farGeo.setAttribute("position", new THREE.BufferAttribute(farPos, 3));

  const farMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.9,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85
  });

  starsFar = new THREE.Points(farGeo, farMat);
  scene.add(starsFar);

  // Near big stars (bokeh)
  const nearCount = 180;
  const nearPos = new Float32Array(nearCount * 3);

  for (let i = 0; i < nearCount; i++) {
    const i3 = i * 3;
    nearPos[i3 + 0] = (Math.random() - 0.5) * 260;
    nearPos[i3 + 1] = (Math.random() - 0.2) * 180;
    nearPos[i3 + 2] = (Math.random() - 0.5) * 260;
  }

  const nearGeo = new THREE.BufferGeometry();
  nearGeo.setAttribute("position", new THREE.BufferAttribute(nearPos, 3));

  const nearMat = new THREE.PointsMaterial({
    color: 0x9ad7ff,
    size: 3.5,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.75
  });

  starsNear = new THREE.Points(nearGeo, nearMat);
  scene.add(starsNear);
}

/* Nebula clouds behind Scorpius */
function createNebulae() {
  nebulaGroup = new THREE.Group();

  const texPurple = createNebulaTexture("rgba(120,80,255,0.55)", "rgba(10,5,40,0)");
  const texTeal = createNebulaTexture("rgba(120,255,220,0.55)", "rgba(10,5,40,0)");
  const texMagenta = createNebulaTexture("rgba(255,130,220,0.48)", "rgba(10,5,40,0)");

  function makeNebula(texture, scale, position, rotationY) {
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.scale.set(scale, scale, scale);
    mesh.position.copy(position);
    mesh.rotation.y = rotationY;
    mesh.rotation.x = THREE.MathUtils.degToRad(-10);
    nebulaGroup.add(mesh);
  }

  makeNebula(texPurple, 260, new THREE.Vector3(0, 0, -220), THREE.MathUtils.degToRad(20));
  makeNebula(texTeal, 210, new THREE.Vector3(-90, -20, -200), THREE.MathUtils.degToRad(-30));
  makeNebula(texMagenta, 240, new THREE.Vector3(80, 20, -230), THREE.MathUtils.degToRad(40));

  scene.add(nebulaGroup);
}

/* Planet + ring + moon */
function createPlanets() {
  const planetGeo = new THREE.SphereGeometry(12, 40, 40);
  const planetMat = new THREE.MeshStandardMaterial({
    color: 0x283247,
    roughness: 0.9,
    metalness: 0.1,
    emissive: 0x111322,
    emissiveIntensity: 0.4
  });

  mainPlanet = new THREE.Mesh(planetGeo, planetMat);
  mainPlanet.position.set(-38, -16, 10);
  scene.add(mainPlanet);

  // Subtle stripes via another mesh (fake detail)
  const stripesGeo = new THREE.SphereGeometry(12.1, 40, 40);
  const stripesMat = new THREE.MeshBasicMaterial({
    color: 0x3c4d70,
    wireframe: true,
    transparent: true,
    opacity: 0.07
  });
  const stripes = new THREE.Mesh(stripesGeo, stripesMat);
  mainPlanet.add(stripes);

  // Ring
  const ringGeo = new THREE.RingGeometry(15, 22, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x9ad7ff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.35
  });
  planetRing = new THREE.Mesh(ringGeo, ringMat);
  planetRing.rotation.x = THREE.MathUtils.degToRad(72);
  planetRing.rotation.y = THREE.MathUtils.degToRad(-18);
  mainPlanet.add(planetRing);

  // Moon
  const moonGeo = new THREE.SphereGeometry(3.1, 24, 24);
  const moonMat = new THREE.MeshStandardMaterial({
    color: 0xcfd3e0,
    roughness: 0.8,
    metalness: 0.05
  });
  moon = new THREE.Mesh(moonGeo, moonMat);
  moon.position.set(22, 6, 0);
  scene.add(moon);
}

/* Space dust near camera */
function createSpaceDust() {
  const dustCount = 260;
  const dustPos = new Float32Array(dustCount * 3);

  for (let i = 0; i < dustCount; i++) {
    const i3 = i * 3;
    dustPos[i3 + 0] = (Math.random() - 0.5) * 80;
    dustPos[i3 + 1] = (Math.random() - 0.5) * 50;
    dustPos[i3 + 2] = (Math.random() - 0.5) * 80;
  }

  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));

  const dustMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.7,
    transparent: true,
    opacity: 0.35
  });

  dustSystem = new THREE.Points(dustGeo, dustMat);
  scene.add(dustSystem);
}

/* Scorpius in 3D, center stage */
function createScorpius3D() {
  scorpiusGroup = new THREE.Group();

  const scorpiusPositions = [
    new THREE.Vector3(-15, 16, 0),
    new THREE.Vector3(-5, 10, 5),
    new THREE.Vector3(4, 5, 2),
    new THREE.Vector3(11, 0, 0),
    new THREE.Vector3(6, -8, -3),
    new THREE.Vector3(-2, -16, -6),
    new THREE.Vector3(9, -23, -4)
  ];

  const starGeo = new THREE.SphereGeometry(1.6, 20, 20);
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xfff5cf,
    linewidth: 2
  });

  const linePoints = [];

  scorpiusPositions.forEach((pos, idx) => {
    const mat = new THREE.MeshBasicMaterial({
      color: idx === 2 ? 0xffe2aa : 0xfff5cf // ngôi sao “tim” sáng hơn
    });

    const star = new THREE.Mesh(starGeo, mat);
    star.position.copy(pos);
    scorpiusGroup.add(star);
    linePoints.push(pos.clone());

    // Halo riêng cho ngôi sao tim
    if (idx === 2) {
      const haloGeo = new THREE.SphereGeometry(3.4, 20, 20);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xfff0c0,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.copy(pos);
      scorpiusGroup.add(halo);
    }
  });

  const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
  const line = new THREE.Line(lineGeo, lineMat);
  scorpiusGroup.add(line);

  // Aura bao quanh cả chòm
  const auraGeo = new THREE.SphereGeometry(32, 32, 32);
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0x8ee0ff,
    transparent: true,
    opacity: 0.1,
    blending: THREE.AdditiveBlending
  });
  const aura = new THREE.Mesh(auraGeo, auraMat);
  aura.position.set(0, -3, -3);
  scorpiusGroup.add(aura);

  scorpiusGroup.scale.set(1.9, 1.9, 1.9);
  scorpiusGroup.position.y = 2;
  scorpiusGroup.rotation.x = THREE.MathUtils.degToRad(-18);

  scene.add(scorpiusGroup);
}

/* Comets (sao băng) */
function spawnComet() {
  const headGeo = new THREE.SphereGeometry(1.1, 16, 16);
  const headMat = new THREE.MeshBasicMaterial({
    color: 0xffffff
  });
  const head = new THREE.Mesh(headGeo, headMat);

  const trailGeo = new THREE.CylinderGeometry(0.05, 1.4, 18, 12, 1, true);
  const trailMat = new THREE.MeshBasicMaterial({
    color: 0x9ad7ff,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide
  });
  const trail = new THREE.Mesh(trailGeo, trailMat);
  trail.rotation.z = Math.PI / 2;

  const comet = new THREE.Group();
  comet.add(head);
  comet.add(trail);

  // Start top-left, move diagonally
  comet.position.set(-160 + Math.random() * 40, 80 + Math.random() * 20, -60 + Math.random() * 40);

  const dir = new THREE.Vector3(1, -0.45, 0.3).normalize();
  const speed = 70 + Math.random() * 30;

  comets.push({
    group: comet,
    velocity: dir.multiplyScalar(speed),
    life: 0,
    maxLife: 2.4 + Math.random() * 0.8
  });

  scene.add(comet);
}

/* ANIMATION LOOP (3D) */
function animateUniverse() {
  if (!universeClock || !renderer || !scene || !camera) return;

  const elapsed = universeClock.getElapsedTime();
  const delta = universeClock.getDelta();

  requestAnimationFrame(animateUniverse);

  /* CAMERA PATH */
  let radius;
  let angle;

  if (elapsed < 5) {
    const t = elapsed / 5; // 0 → 1
    radius = 120 - 55 * t;          // zoom-in
    angle = THREE.MathUtils.degToRad(-25 + 30 * t);
  } else {
    radius = 65;
    angle = elapsed * 0.12;
  }

  const camHeight = 20;
  camera.position.x = Math.cos(angle) * radius;
  camera.position.z = Math.sin(angle) * radius;
  camera.position.y = camHeight;
  camera.lookAt(0, 0, 0);

  /* BACKGROUND MOTION */
  if (starsFar) starsFar.rotation.y += 0.0006;
  if (starsNear) starsNear.rotation.y += 0.0012;
  if (nebulaGroup) nebulaGroup.rotation.y += 0.0005;
  if (dustSystem) {
    dustSystem.rotation.y += 0.0008;
    dustSystem.rotation.x += 0.0003;
  }

  /* PLANET & MOON */
  if (mainPlanet) mainPlanet.rotation.y += 0.0009;
  if (planetRing) planetRing.rotation.z += 0.0007;

  if (moon && mainPlanet) {
    const moonAngle = elapsed * 0.45;
    const orbitRadius = 25;
    moon.position.set(
      mainPlanet.position.x + Math.cos(moonAngle) * orbitRadius,
      mainPlanet.position.y + 6,
      mainPlanet.position.z + Math.sin(moonAngle) * orbitRadius
    );
  }

  /* SCORPIUS GLOW + WOBBLE */
  if (scorpiusGroup) {
    const baseRotY = THREE.MathUtils.degToRad(-8);
    const baseRotX = THREE.MathUtils.degToRad(-18);

    const wobbleY = Math.sin(elapsed * 0.25) * THREE.MathUtils.degToRad(4);
    const wobbleX = Math.sin(elapsed * 0.18 + 1.2) * THREE.MathUtils.degToRad(2);

    scorpiusGroup.rotation.y = baseRotY + wobbleY;
    scorpiusGroup.rotation.x = baseRotX + wobbleX;

    scorpiusGroup.children.forEach(obj => {
      if (obj.isMesh) {
        const pulse = 0.6 + 0.4 * Math.sin(elapsed * 1.4);
        const baseColor = new THREE.Color(obj.material.color.getHex());
        const brightened = baseColor.clone().multiplyScalar(1.0 + 0.4 * pulse);
        obj.material.color.copy(brightened);
      }
    });
  }

  /* COMETS */
  cometTimer += delta;
  if (cometTimer > 3.0 + Math.random() * 2.5) {
    cometTimer = 0;
    spawnComet();
  }

  comets = comets.filter(c => {
    c.life += delta;
    const t = delta;

    c.group.position.x += c.velocity.x * t;
    c.group.position.y += c.velocity.y * t;
    c.group.position.z += c.velocity.z * t;

    const fade = 1 - c.life / c.maxLife;
    if (fade <= 0 || c.group.position.length() > 400) {
      scene.remove(c.group);
      return false;
    } else {
      c.group.children.forEach(child => {
        if (child.material && child.material.opacity !== undefined) {
          child.material.opacity = Math.max(0, fade);
        }
      });
      return true;
    }
  });

  renderer.render(scene, camera);
}
