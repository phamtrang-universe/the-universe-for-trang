/* scripts.js */

const canvas = document.getElementById('universeCanvas');
const ctx = canvas.getContext('2d');
const textEl = document.getElementById('mainText');
const nextBtn = document.getElementById('nextBtn');
const bgMusic = document.getElementById('bgMusic');

// Cấu hình màn hình
let width, height;
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}
window.addEventListener('resize', resize);
resize();

// ==========================================
// DỮ LIỆU CÂU CHUYỆN (Tiếng Anh)
// ==========================================
const PHASES = [
    {
        id: 1,
        text: "The universe is vast and silent, waiting for a spark...",
        type: "intro" 
    },
    {
        id: 2,
        text: "Tap the glowing stars to trace the constellation that belongs to you.",
        type: "interactive" // Vẽ chòm sao
    },
    {
        id: 3,
        text: "Like Scorpius in the night sky, you shine the brightest in my universe.",
        type: "final"
    }
];

let currentPhaseIndex = 0;
let isMusicPlaying = false;

// ==========================================
// HỆ THỐNG SAO (STAR SYSTEM)
// ==========================================
const stars = [];
const NUM_STARS = 150;

class Star {
    constructor() {
        this.reset();
        // Cho sao xuất hiện ngẫu nhiên ban đầu
        this.y = Math.random() * height;
    }

    reset() {
        this.x = Math.random() * width;
        this.y = -10; // Bắt đầu từ trên đỉnh
        this.size = Math.random() * 2 + 0.5;
        this.speed = Math.random() * 0.5 + 0.1;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.twinkleSpeed = Math.random() * 0.05 + 0.01;
    }

    update() {
        this.y += this.speed;
        this.opacity += Math.sin(Date.now() * this.twinkleSpeed) * 0.01;
        
        // Reset khi đi hết màn hình
        if (this.y > height) this.reset();
    }

    draw() {
        ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity));
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Khởi tạo sao nền
for(let i=0; i<NUM_STARS; i++) stars.push(new Star());

// ==========================================
// CHÒM SAO BỌ CẠP (SCORPIUS LOGIC)
// ==========================================
// Tọa độ tương đối (0.0 đến 1.0) để vẽ Bọ Cạp chuẩn xác
const SCORPIO_COORDS = [
    {x: 0.65, y: 0.15}, // Đầu
    {x: 0.60, y: 0.22},
    {x: 0.55, y: 0.30}, // Thân trên
    {x: 0.50, y: 0.40}, // Antares (Tim Bọ Cạp)
    {x: 0.45, y: 0.55},
    {x: 0.45, y: 0.68},
    {x: 0.50, y: 0.78}, // Đuôi cong
    {x: 0.60, y: 0.82},
    {x: 0.70, y: 0.75}  // Ngòi
];

let scorpioPoints = []; // Tọa độ thực tế trên màn hình
let connectedPoints = 0; // Số điểm đã nối

function initScorpio() {
    scorpioPoints = SCORPIO_COORDS.map(p => ({
        x: p.x * width,
        y: p.y * height,
        r: 6, // Bán kính điểm chạm
        active: false
    }));
}

// ==========================================
// VÒNG LẶP ANIMATION CHÍNH
// ==========================================
function animate() {
    ctx.clearRect(0, 0, width, height);

    // 1. Vẽ sao nền
    stars.forEach(s => {
        s.update();
        s.draw();
    });

    // 2. Logic riêng cho Phase 2 (Vẽ chòm sao)
    if (currentPhaseIndex === 1 || currentPhaseIndex === 2) {
        drawScorpio();
    }

    requestAnimationFrame(animate);
}

function drawScorpio() {
    // Vẽ đường nối
    if (connectedPoints > 0) {
        ctx.strokeStyle = "rgba(168, 188, 255, 0.5)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < connectedPoints; i++) {
            if (i === 0) ctx.moveTo(scorpioPoints[i].x, scorpioPoints[i].y);
            else ctx.lineTo(scorpioPoints[i].x, scorpioPoints[i].y);
        }
        // Vẽ đường đang kéo theo chuột/tay (nếu chưa xong)
        // (Phần này giản lược để giữ code sạch, chỉ nối khi chạm đúng)
        ctx.stroke();
    }

    // Vẽ các điểm sao
    scorpioPoints.forEach((p, index) => {
        // Chỉ hiện điểm tiếp theo cần nối hoặc các điểm đã nối
        if (index <= connectedPoints) {
            // Hiệu ứng Glow cho điểm đang chờ
            const isNext = index === connectedPoints;
            const glowSize = isNext ? 15 + Math.sin(Date.now() * 0.005)*5 : 10;
            const alpha = isNext ? 0.8 : 0.4;

            // Vẽ Glow
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
            grad.addColorStop(0, `rgba(168, 188, 255, ${alpha})`);
            grad.addColorStop(1, "rgba(0,0,0,0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(p.x, p.y, glowSize, 0, Math.PI*2);
            ctx.fill();

            // Vẽ tâm sao
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
            ctx.fill();
        }
    });
}

// ==========================================
// TƯƠNG TÁC (INTERACTION)
// ==========================================

// Xử lý chuyển cảnh
function setPhase(index) {
    if (index >= PHASES.length) return;
    currentPhaseIndex = index;

    // Ẩn text cũ
    textEl.classList.remove('visible');
    nextBtn.classList.remove('show');

    setTimeout(() => {
        // Cập nhật text mới
        textEl.innerText = PHASES[index].text;
        textEl.classList.add('visible');

        // Logic từng phase
        if (PHASES[index].type === 'intro') {
            nextBtn.classList.add('show');
        } 
        else if (PHASES[index].type === 'interactive') {
            initScorpio(); // Tính toán vị trí sao
            // Không hiện nút Next, đợi người dùng vẽ xong
        }
        else if (PHASES[index].type === 'final') {
            // Phase cuối
        }
    }, 1000);
}

// Xử lý chạm màn hình (Chung)
document.addEventListener('pointerdown', (e) => {
    // 1. Tự động bật nhạc ở lần chạm đầu tiên
    if (!isMusicPlaying && bgMusic) {
        bgMusic.volume = 0.5;
        bgMusic.play().then(() => isMusicPlaying = true).catch(e => console.log(e));
    }

    // 2. Logic nối sao (Chỉ ở Phase 2)
    if (currentPhaseIndex === 1 && connectedPoints < scorpioPoints.length) {
        const target = scorpioPoints[connectedPoints];
        const dist = Math.hypot(e.clientX - target.x, e.clientY - target.y);
        
        // Nếu chạm gần điểm cần nối (sai số 40px)
        if (dist < 40) {
            connectedPoints++;
            
            // Nếu đã nối xong hết
            if (connectedPoints === scorpioPoints.length) {
                setTimeout(() => {
                    nextBtn.classList.add('show'); // Hiện nút Next
                }, 500);
            }
        }
    }
});

nextBtn.addEventListener('click', () => {
    setPhase(currentPhaseIndex + 1);
});

// Bắt đầu
resize();
animate();
setPhase(0);
