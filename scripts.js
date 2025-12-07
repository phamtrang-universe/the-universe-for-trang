document.addEventListener('DOMContentLoaded', () => {
    console.log("Script loaded!"); // Kiểm tra xem file JS đã chạy chưa

    // --- CẤU HÌNH ---
    const ACCESS_CODE = "161103"; 
    
    // --- DOM ELEMENTS ---
    const gateScreen = document.getElementById('gate-screen');
    const passInput = document.getElementById('pass-input');
    const unlockBtn = document.getElementById('unlock-btn');
    const errorMsg = document.getElementById('error-msg');
    
    const openingScreen = document.getElementById('opening-screen');
    const introCanvas = document.getElementById('intro-canvas');
    
    const mainJourney = document.getElementById('main-journey');
    const bgMusic = document.getElementById('bg-music');

    // --- VARIABLES ---
    let introCtx = introCanvas.getContext('2d');
    let w, h;
    let stars = []; 
    let constellation = []; 
    let isIntroActive = false;
    
    let drawState = {
        started: false,      
        completed: false,    
        progress: 0,         
        speed: 0.03          
    };

    // =========================================
    // 1. XỬ LÝ MẬT MÃ (SỬA LỖI)
    // =========================================
    
    function checkPassword() {
        // Lấy giá trị và xóa khoảng trắng thừa (nếu có)
        const userCode = passInput.value.trim();
        
        console.log("User entered:", userCode); // Xem log trên trình duyệt

        if (userCode === ACCESS_CODE) {
            console.log("Password Correct!");
            unlockUniverse();
        } else {
            console.log("Password Wrong!");
            errorMsg.style.opacity = '1';
            passInput.value = "";
            // Rung nhẹ ô input
            passInput.style.transform = "translateX(5px)";
            setTimeout(() => passInput.style.transform = "translateX(-5px)", 50);
            setTimeout(() => passInput.style.transform = "translateX(0)", 100);
            
            setTimeout(() => errorMsg.style.opacity = '0', 2000);
        }
    }

    // Sự kiện Click chuột
    if (unlockBtn) {
        unlockBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Ngăn hành vi mặc định (quan trọng trên mobile)
            checkPassword();
        });
    } else {
        console.error("Lỗi: Không tìm thấy nút unlock-btn");
    }
    
    // Sự kiện ấn Enter
    if (passInput) {
        passInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkPassword();
        });
    }

    function unlockUniverse() {
        // 1. Phát nhạc (Cần tương tác người dùng trước đó)
        if(bgMusic) {
            bgMusic.volume = 0.6;
            bgMusic.play().catch(e => console.log("Chưa thể phát nhạc tự động: ", e));
        }

        // 2. Ẩn màn hình Gate
        gateScreen.style.transition = "opacity 1s ease";
        gateScreen.style.opacity = 0;
        
        setTimeout(() => {
            gateScreen.style.display = 'none';
            
            // 3. Hiện màn hình Opening
            openingScreen.classList.remove('hidden');
            // Trigger animation
            setTimeout(() => {
                openingScreen.style.opacity = 1;
                document.getElementById('opening-title').style.animation = "fadeInUp 1.5s ease forwards";
                document.getElementById('opening-subtitle').style.animation = "fadeInUp 1.5s ease forwards 0.5s";
            }, 50);

            // 4. Khởi tạo Canvas
            isIntroActive = true;
            resize();
            initConstellation(); 
            initBackgroundStars(); // Thêm dòng này để khởi tạo sao nền
            renderIntro();       
        }, 1000); 
    }

    // =========================================
    // 2. HỆ THỐNG ĐỒ HỌA
    // =========================================

    function resize() {
        const container = document.getElementById('bottom-canvas-area');
        if (container) {
            w = container.clientWidth;
            h = container.clientHeight;
            
            introCanvas.width = w * window.devicePixelRatio;
            introCanvas.height = h * window.devicePixelRatio;
            introCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
            
            if(isIntroActive) {
                initConstellation();
                // Re-init stars nếu cần thiết để trải đều màn hình
                if(stars.length === 0) initBackgroundStars();
            }
        }
    }
    window.addEventListener('resize', resize);

    function initBackgroundStars() {
        stars = [];
        for(let i=0; i<80; i++) { // Tăng số lượng sao lên một chút
            stars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() * 1.5,
                opacity: Math.random(),
                speed: Math.random() * 0.05 + 0.01
            });
        }
    }

    // Tọa độ Bọ Cạp
    const SCORPIO_DATA = [
        {x: 0.7, y: 0.1}, {x: 0.6, y: 0.2}, {x: 0.5, y: 0.3},
        {x: 0.45, y: 0.45}, {x: 0.5, y: 0.6}, {x: 0.6, y: 0.75},
        {x: 0.75, y: 0.8}, {x: 0.85, y: 0.7}, {x: 0.9, y: 0.65}
    ];

    function initConstellation() {
        // Căn chỉnh tọa độ Bọ Cạp vào giữa vùng Canvas 70%
        // w và h ở đây là của bottom-canvas-area
        constellation = SCORPIO_DATA.map(p => ({
            // Logic căn giữa:
            // X: (w/2) + (offset từ tâm)
            x: (w * 0.5) + (p.x - 0.65) * (w * 0.8), 
            y: (h * 0.1) + (p.y) * (h * 0.8), // Đẩy xuống một chút
            r: (p === SCORPIO_DATA[3]) ? 6 : 4,
            isAntares: (p === SCORPIO_DATA[3])
        }));
    }

    function renderIntro() {
        if (!isIntroActive) return;

        introCtx.clearRect(0, 0, w, h);

        // Vẽ sao nền
        introCtx.fillStyle = "white";
        stars.forEach(s => {
            s.y -= s.speed;
            if(s.y < 0) s.y = h;
            introCtx.globalAlpha = s.opacity;
            introCtx.beginPath();
            introCtx.arc(s.x, s.y, s.size, 0, Math.PI*2);
            introCtx.fill();
        });

        // Logic vẽ dây tự động
        if (drawState.started && !drawState.completed) {
            drawState.progress += drawState.speed;
            if (drawState.progress >= constellation.length - 1) {
                drawState.progress = constellation.length - 1;
                drawState.completed = true;
                onConstellationComplete();
            }
        }

        // Vẽ dây nối
        if (drawState.progress > 0) {
            introCtx.save();
            introCtx.beginPath();
            introCtx.strokeStyle = "rgba(224, 192, 151, 0.6)";
            introCtx.lineWidth = 1.5;
            introCtx.shadowBlur = 10;
            introCtx.shadowColor = "rgba(224, 192, 151, 0.8)";
            introCtx.lineCap = "round";
            introCtx.lineJoin = "round";

            const lastIndex = Math.floor(drawState.progress);
            const t = drawState.progress - lastIndex;

            if (constellation.length > 0) {
                introCtx.moveTo(constellation[0].x, constellation[0].y);
                for(let i=1; i<=lastIndex; i++) {
                    introCtx.lineTo(constellation[i].x, constellation[i].y);
                }
                if (lastIndex < constellation.length - 1) {
                    const p1 = constellation[lastIndex];
                    const p2 = constellation[lastIndex + 1];
                    const cx = p1.x + (p2.x - p1.x) * t;
                    const cy = p1.y + (p2.y - p1.y) * t;
                    introCtx.lineTo(cx, cy);
                }
            }
            introCtx.stroke();
            introCtx.restore();
        }

        // Vẽ điểm sao
        constellation.forEach((p, idx) => {
            if (idx === 0 || idx <= Math.floor(drawState.progress)) {
                introCtx.globalAlpha = 1;
                
                // Pulse cho điểm đầu
                if (idx === 0 && !drawState.started) {
                    const pulse = 15 + Math.sin(Date.now() * 0.005) * 5;
                    const grad = introCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulse);
                    grad.addColorStop(0, "rgba(224, 192, 151, 0.6)");
                    grad.addColorStop(1, "transparent");
                    introCtx.fillStyle = grad;
                    introCtx.beginPath();
                    introCtx.arc(p.x, p.y, pulse, 0, Math.PI*2);
                    introCtx.fill();
                }

                introCtx.fillStyle = p.isAntares ? "#ffbd80" : "#fff";
                introCtx.beginPath();
                introCtx.arc(p.x, p.y, p.r, 0, Math.PI*2);
                introCtx.fill();
            }
        });

        requestAnimationFrame(renderIntro);
    }

    introCanvas.addEventListener('pointerdown', (e) => {
        if (drawState.started) return;

        const rect = introCanvas.getBoundingClientRect();
        // Lấy toạ độ tương đối chuẩn xác
        const scaleX = introCanvas.width / rect.width;
        const scaleY = introCanvas.height / rect.height;
        
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;

        const target = constellation[0];
        // Tính khoảng cách (đã scale)
        const dist = Math.hypot(clickX - target.x, clickY - target.y);

        // Vùng chạm rộng 60px
        if (dist < 60 * window.devicePixelRatio) {
            drawState.started = true;
            const subtitle = document.getElementById('opening-subtitle');
            subtitle.style.transition = "opacity 0.5s";
            subtitle.style.opacity = 0;
            setTimeout(() => {
                subtitle.innerText = "Watching the stars align for you...";
                subtitle.style.opacity = 1;
            }, 500);
        }
    });

    function onConstellationComplete() {
        setTimeout(() => {
            transitionToMainJourney();
        }, 2000);
    }

    // =========================================
    // 3. GALAXY ENDING
    // =========================================
    let mainCanvas = document.getElementById('main-canvas');
    let mainCtx = mainCanvas.getContext('2d');
    let galaxyParticles = [];
    let shootingStars = [];
    let journeyActive = false;

    function transitionToMainJourney() {
        openingScreen.style.transition = "opacity 2s ease";
        openingScreen.style.opacity = 0;
        
        setTimeout(() => {
            openingScreen.classList.add('hidden');
            isIntroActive = false; 

            mainJourney.classList.remove('hidden');
            mainJourney.classList.add('visible');
            
            initMainJourney();
        }, 2000);
    }

    function initMainJourney() {
        journeyActive = true;
        mainCanvas.width = window.innerWidth * window.devicePixelRatio;
        mainCanvas.height = window.innerHeight * window.devicePixelRatio;
        mainCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        for(let i=0; i<800; i++) galaxyParticles.push(new GalaxyParticle());

        // Tạo chữ kết thúc bằng JS để dễ kiểm soát
        const finalContainer = document.getElementById('journey-text-container');
        // Xóa nội dung cũ nếu có
        finalContainer.innerHTML = '';
        
        const h1 = document.createElement('h1');
        h1.innerText = "My Universe";
        h1.style.cssText = "font-family:'Parisienne'; color:#e0c097; font-size:3rem; text-shadow:0 0 15px rgba(224,192,151,0.5); margin-bottom:10px; opacity:0; transition:opacity 3s ease 1s;";
        
        const p = document.createElement('p');
        p.innerText = "Where you shine the brightest.";
        p.style.cssText = "font-family:'Inter'; color:#fff; font-size:1rem; opacity:0; letter-spacing:2px; transition:opacity 3s ease 2s;";
        
        // CSS cho container chữ kết thúc
        finalContainer.style.position = 'absolute';
        finalContainer.style.top = '50%';
        finalContainer.style.left = '50%';
        finalContainer.style.transform = 'translate(-50%, -50%)';
        finalContainer.style.textAlign = 'center';
        finalContainer.style.pointerEvents = 'none';
        
        finalContainer.appendChild(h1);
        finalContainer.appendChild(p);

        setTimeout(() => {
            h1.style.opacity = 1;
            p.style.opacity = 0.8;
        }, 500);

        renderGalaxy();
    }

    class GalaxyParticle {
        constructor() {
            this.w = window.innerWidth;
            this.h = window.innerHeight;
            this.reset();
            const colors = ["#a8c7ff", "#c4a8ff", "#ffacd8", "#ffffff"];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        reset() {
            this.angle = Math.random() * Math.PI * 2;
            this.radius = Math.random() * (Math.min(this.w, this.h) * 0.45); 
            this.size = Math.random() * 1.5 + 0.1;
            this.speed = (1 / this.radius) * 40 + 0.01; 
        }
        update() {
            this.angle += this.speed * 0.0005; 
            this.x = this.w / 2 + Math.cos(this.angle) * this.radius;
            this.y = this.h / 2 + Math.sin(this.angle) * this.radius * 0.8; 
        }
        draw() {
            mainCtx.globalCompositeOperation = "lighter";
            mainCtx.fillStyle = this.color;
            mainCtx.globalAlpha = 1 - (this.radius / (Math.min(this.w,this.h)*0.6)); 
            mainCtx.beginPath();
            mainCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            mainCtx.fill();
        }
    }

    class ShootingStar {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight * 0.5;
            this.len = Math.random() * 80 + 20;
            this.speed = Math.random() * 6 + 4;
            this.size = Math.random() * 1 + 0.1;
            this.angle = Math.PI / 4 + (Math.random() * 0.2); 
            this.opacity = 1;
        }
        update() {
            this.x += this.speed * Math.cos(this.angle);
            this.y += this.speed * Math.sin(this.angle);
            this.opacity -= 0.01;
            if (this.opacity <= 0) this.reset();
        }
        draw() {
            mainCtx.strokeStyle = "rgba(255, 255, 255, " + this.opacity + ")";
            mainCtx.lineWidth = this.size;
            mainCtx.beginPath();
            mainCtx.moveTo(this.x, this.y);
            mainCtx.lineTo(this.x - this.len * Math.cos(this.angle), this.y - this.len * Math.sin(this.angle));
            mainCtx.stroke();
        }
    }

    function renderGalaxy() {
        if (!journeyActive) return;
        mainCtx.globalCompositeOperation = "source-over";
        mainCtx.fillStyle = "rgba(5, 5, 16, 0.2)"; 
        mainCtx.fillRect(0, 0, window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
        galaxyParticles.forEach(p => { p.update(); p.draw(); });
        if (Math.random() < 0.03 && shootingStars.length < 3) shootingStars.push(new ShootingStar());
        shootingStars.forEach((s, i) => {
            s.update(); s.draw();
            if (s.opacity <= 0) shootingStars.splice(i, 1);
        });
        requestAnimationFrame(renderGalaxy);
    }
});
