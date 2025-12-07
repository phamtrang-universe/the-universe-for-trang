const canvas = document.getElementById('universe');
const ctx = canvas.getContext('2d');

// UI Elements
const mainTitle = document.getElementById('main-title');
const statusLog = document.getElementById('status-log');
const engageBtn = document.getElementById('engage-btn');
const targetFrame = document.getElementById('target-frame');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const systemStatus = document.getElementById('system-status');
const sigStrength = document.getElementById('sig-strength');

// Audio
const bgMusic = document.getElementById('bg-music');
const sfx = document.getElementById('sfx-interact'); // Tùy chọn

let w, h;
let particles = [];
let shootingStars = [];
let warpSpeed = false; // Trạng thái tăng tốc

// =========================================
// 1. KỊCH BẢN (STORYLINE)
// =========================================
const PHASES = [
    {
        id: 0,
        title: "SYSTEM START",
        log: "Tap screen to initialize system...",
        type: "start"
    },
    {
        id: 1,
        title: "SECTOR 7",
        log: "Scanning deep space coordinates...",
        type: "scan" // Chạy thanh loading
    },
    {
        id: 2,
        title: "TARGET DETECTED",
        log: "Anomaly found. Locking target...",
        type: "lock" // Hiện khung ngắm
    },
    {
        id: 3,
        title: "DECRYPTION",
        log: "Trace the pattern to unlock data.",
        type: "constellation" // Vẽ Bọ Cạp
    },
    {
        id: 4,
        title: "TRANG NEBULA",
        log: "Destination reached. Welcome home.",
        type: "climax"
    }
];

let currentPhase = 0;
let isAudioUnlocked = false;

// =========================================
// 2. CORE SYSTEM (Resize & Loop)
// =========================================
function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}
window.addEventListener('resize', resize);
resize();

// --- STAR SYSTEM ---
class Star {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = (Math.random() * w) - (w * 0.5); // Tọa độ từ tâm
        this.y = (Math.random() * h) - (h * 0.5);
        this.z = Math.random() * w; // Độ sâu
        this.size = 0.5;
    }
    update() {
        // Hiệu ứng Warp Speed (Bay từ tâm ra ngoài)
        let speed = warpSpeed ? 40 : 2; 
        this.z -= speed;

        if (this.z <= 0) this.reset();
    }
    draw() {
        // Chuyển đổi 3D sang 2D
        let x2d = (this.x / this.z) * w + (w / 2);
        let y2d = (this.y / this.z) * h + (h / 2);
        
        // Kích thước sao lớn hơn khi lại gần
        let s = (w / this.z) * this.size; 

        if (x2d > 0 && x2d < w && y2d > 0 && y2d < h) {
            let alpha = 1 - (this.z / w);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            
            // Nếu Warp Speed thì vẽ vệt dài
            if (warpSpeed) {
                ctx.strokeStyle = `rgba(168, 199, 255, ${alpha})`;
                ctx.lineWidth = s;
                ctx.beginPath();
                ctx.moveTo(x2d, y2d);
                ctx.lineTo((this.x / (this.z + 50)) * w + w/2, (this.y / (this.z + 50)) * h + h/2);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(x2d, y2d, s, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// Khởi tạo 400 ngôi sao
for (let i = 0; i < 400; i++) particles.push(new Star());

// --- MAIN LOOP ---
function render() {
    // Làm mờ nhẹ để tạo đuôi (Trails)
    ctx.fillStyle = "rgba(2, 2, 5, 0.4)"; 
    ctx.fillRect(0, 0, w, h);

    particles.forEach(p => { p.update(); p.draw(); });

    // Vẽ Bọ Cạp (Chỉ ở Phase 3 & 4)
    if (currentPhase >= 3) {
        drawConstellation();
    }

    // Hiệu ứng Climax (Sao băng)
    if (currentPhase === 4) {
        renderShootingStars();
    }

    requestAnimationFrame(render);
}

// =========================================
// 3. UI & TYPEWRITER FX
// =========================================
function typeWriter(element, text, speed = 30) {
    element.innerHTML = "";
    let i = 0;
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

function updateUI() {
    const data = PHASES[currentPhase];
    
    // Reset trạng thái
    mainTitle.classList.remove('glitch');
    engageBtn.classList.remove('visible');
    engageBtn.classList.add('hidden');
    targetFrame.classList.add('hidden');
    progressContainer.classList.add('hidden');
    
    // Cập nhật Text
    mainTitle.innerText = data.title;
    // Hiệu ứng gõ chữ cho dòng log
    typeWriter(statusLog, data.log);

    // Xử lý riêng từng Phase
    if (data.type === 'scan') {
        progressContainer.classList.remove('hidden');
        setTimeout(() => {
            progressBar.style.width = "100%"; // Chạy thanh loading
        }, 100);
        // Tự động qua màn sau 3s
        setTimeout(() => {
            nextPhase();
        }, 3500);
    }

    if (data.type === 'lock') {
        targetFrame.classList.remove('hidden');
        systemStatus.innerText = "TARGET LOCKED";
        systemStatus.style.color = "red";
        setTimeout(() => {
            engageBtn.classList.remove('hidden');
            setTimeout(() => engageBtn.classList.add('visible'), 100);
        }, 1500);
    }

    if (data.type === 'constellation') {
        initConstellation();
        systemStatus.innerText = "DECODING...";
        systemStatus.style.color = "#00f3ff";
    }

    if (data.type === 'climax') {
        systemStatus.innerText = "ARRIVED";
        mainTitle.classList.add('glitch'); // Chữ giật giật
    }
}

// =========================================
// 4. LOGIC BỌ CẠP (SCORPIUS)
// =========================================
const SCORPIO = [
    {x: 0, y: -200}, {x: -30, y: -160}, {x: -50, y: -110},
    {x: -40, y: -50}, {x: -20, y: 10}, {x: 10, y: 60},
    {x: 50, y: 100}, {x: 90, y: 90}, {x: 100, y: 70}
];
let constellation = [];
let connectedIndex = 0;

function initConstellation() {
    const cx = w / 2;
    const cy = h * 0.45; // Vị trí tâm chòm sao
    const scale = Math.min(w, h) / 500;
    
    constellation = SCORPIO.map(p => ({
        x: cx + p.x * scale,
        y: cy + p.y * scale,
        r: 25 * scale // Vùng chạm
    }));
}

function drawConstellation() {
    if (connectedIndex > 0) {
        ctx.strokeStyle = "rgba(0, 243, 255, 0.6)"; // Màu Cyan Neon
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#00f3ff";
        
        ctx.beginPath();
        for (let i = 0; i < connectedIndex; i++) {
            if (i === 0) ctx.moveTo(constellation[i].x, constellation[i].y);
            else ctx.lineTo(constellation[i].x, constellation[i].y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    constellation.forEach((p, idx) => {
        if (idx <= connectedIndex) {
            let isTarget = idx === connectedIndex;
            ctx.fillStyle = isTarget ? "#fff" : "#00f3ff";
            
            // Target Blink
            if (isTarget && currentPhase === 3) {
                let pulse = 10 + Math.sin(Date.now() * 0.01) * 5;
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(p.x, p.y, pulse, 0, Math.PI*2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
            ctx.fill();
        }
    });
}

// =========================================
// 5. INPUT & TRANSITION
// =========================================
function nextPhase() {
    if (currentPhase < PHASES.length - 1) {
        // Hiệu ứng Warp Speed khi chuyển cảnh
        warpSpeed = true;
        setTimeout(() => warpSpeed = false, 1500);

        currentPhase++;
        updateUI();
    }
}

document.addEventListener('pointerdown', (e) => {
    // 1. Mở khóa Audio (Lần chạm đầu)
    if (!isAudioUnlocked) {
        bgMusic.volume = 0.6;
        bgMusic.play().then(() => {
            isAudioUnlocked = true;
            nextPhase(); // Vào Phase 1
        }).catch(err => console.log(err));
        return;
    }

    // 2. Logic vẽ sao (Phase 3)
    if (PHASES[currentPhase].type === 'constellation') {
        if (connectedIndex < constellation.length) {
            const t = constellation[connectedIndex];
            const dist = Math.hypot(e.clientX - t.x, e.clientY - t.y);
            
            if (dist < 50) {
                connectedIndex++;
                // Play SFX (nếu có)
                if(sfx) { sfx.currentTime=0; sfx.play().catch(()=>{}); }

                // Cập nhật tín hiệu ngẫu nhiên
                sigStrength.innerText = Math.floor(Math.random() * 100) + " dB";

                if (connectedIndex === constellation.length) {
                    setTimeout(() => {
                        engageBtn.classList.remove('hidden');
                        setTimeout(() => engageBtn.classList.add('visible'), 100);
                    }, 500);
                }
            }
        }
    }
});

engageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    nextPhase();
});

// Chạy
render();
typeWriter(statusLog, PHASES[0].log); // Chạy dòng log đầu tiên
