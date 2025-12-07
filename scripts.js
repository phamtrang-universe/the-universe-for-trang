document.addEventListener('DOMContentLoaded', () => {
    // --- CẤU HÌNH ---
    const ACCESS_CODE = "161103";
    
    // --- DOM ---
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
        started: false, completed: false, progress: 0, speed: 0.025
    };

    // =========================================
    // 1. XỬ LÝ MẬT MÃ
    // =========================================
    function checkPassword() {
        if (passInput.value.trim() === ACCESS_CODE) {
            unlockUniverse();
        } else {
            errorMsg.style.opacity = '1';
            passInput.value = "";
            setTimeout(() => errorMsg.style.opacity = '0', 2000);
        }
    }

    if (unlockBtn) unlockBtn.addEventListener('click', (e) => { e.preventDefault(); checkPassword(); });
    if (passInput) passInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') checkPassword(); });

    function unlockUniverse() {
        if(bgMusic) { bgMusic.volume = 0.6; bgMusic.play().catch(()=>{}); }

        gateScreen.style.transition = "opacity 1.5s ease";
        gateScreen.style.opacity = 0;
        
        setTimeout(() => {
            gateScreen.style.display = 'none';
            openingScreen.classList.remove('hidden');
            setTimeout(() => openingScreen.classList.add('visible'), 50);

            isIntroActive = true;
            resize();
            initBackgroundStars();
            renderIntro();
            
            // TỰ ĐỘNG VẼ SAU 1.5 GIÂY
            setTimeout(() => {
                drawState.started = true;
                const sub = document.getElementById('opening-subtitle');
                if(sub) {
                    sub.style.opacity = 0;
                    setTimeout(() => {
                        sub.innerText = "Watching the stars align for you...";
                        sub.style.opacity = 1;
                    }, 500);
                }
            }, 1500);

        }, 1200);
    }

    // =========================================
    // 2. VẼ BỌ CẠP (INTRO)
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
                if(stars.length === 0) initBackgroundStars();
            }
        }
    }
    window.addEventListener('resize', resize);

    function initBackgroundStars() {
        stars = [];
        for(let i=0; i<80; i++) {
            stars.push({
                x: Math.random() * w, y: Math.random() * h,
                size: Math.random() * 1.5, opacity: Math.random(), speed: Math.random() * 0.05 + 0.01
            });
        }
    }

    const SCORPIO_DATA = [
        {x: 0.7, y: 0.1}, {x: 0.6, y: 0.2}, {x: 0.5, y: 0.3},
        {x: 0.45, y: 0.45}, {x: 0.5, y: 0.6}, {x: 0.6, y: 0.75},
        {x: 0.75, y: 0.8}, {x: 0.85, y: 0.7}, {x: 0.9, y: 0.65}
    ];

    function initConstellation() {
        constellation = SCORPIO_DATA.map(p => ({
            x: (w * 0.5) + (p.x - 0.65) * (w * 0.8), 
            y: (h * 0.1) + (p.y) * (h * 0.75),
            r: (p === SCORPIO_DATA[3]) ? 6 : 4,
            isAntares: (p === SCORPIO_DATA[3])
        }));
    }

    function renderIntro() {
        if (!isIntroActive) return;
        introCtx.clearRect(0, 0, w, h);

        introCtx.fillStyle = "white";
        stars.forEach(s => {
            s.y -= s.speed; if(s.y < 0) s.y = h;
            introCtx.globalAlpha = s.opacity;
            introCtx.beginPath(); introCtx.arc(s.x, s.y, s.size, 0, Math.PI*2); introCtx.fill();
        });

        if (drawState.started && !drawState.completed) {
            drawState.progress += drawState.speed;
            if (drawState.progress >= constellation.length - 1) {
                drawState.progress = constellation.length - 1;
                drawState.completed = true;
                setTimeout(startGalaxySequence, 1500);
            }
        }

        if (drawState.progress > 0) {
            introCtx.save();
            introCtx.beginPath();
            introCtx.strokeStyle = "rgba(224, 192, 151, 0.6)"; introCtx.lineWidth = 1.5;
            introCtx.shadowBlur = 15; introCtx.shadowColor = "rgba(224, 192, 151, 0.8)";
            introCtx.lineCap = "round"; introCtx.lineJoin = "round";
            
            const lastIndex = Math.floor(drawState.progress);
            const t = drawState.progress - lastIndex;
            
            if (constellation.length > 0) {
                introCtx.moveTo(constellation[0].x, constellation[0].y);
                for(let i=1; i<=lastIndex; i++) introCtx.lineTo(constellation[i].x, constellation[i].y);
                if (lastIndex < constellation.length - 1) {
                    const p1 = constellation[lastIndex]; const p2 = constellation[lastIndex + 1];
                    introCtx.lineTo(p1.x + (p2.x - p1.x) * t, p1.y + (p2.y - p1.y) * t);
                }
            }
            introCtx.stroke(); introCtx.restore();
        }

        constellation.forEach((p, idx) => {
            if (idx === 0 || idx <= Math.floor(drawState.progress)) {
                introCtx.globalAlpha = 1;
                if (idx === 0 && !drawState.started) {
                    const pulse = 15 + Math.sin(Date.now() * 0.005) * 5;
                    const grad = introCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulse);
                    grad.addColorStop(0, "rgba(224, 192, 151, 0.6)"); grad.addColorStop(1, "transparent");
                    introCtx.fillStyle = grad; introCtx.beginPath(); introCtx.arc(p.x, p.y, pulse, 0, Math.PI*2); introCtx.fill();
                }
                introCtx.fillStyle = p.isAntares ? "#ffbd80" : "#fff";
                introCtx.beginPath(); introCtx.arc(p.x, p.y, p.r, 0, Math.PI*2); introCtx.fill();
            }
        });
        requestAnimationFrame(renderIntro);
    }

    // =========================================
    // 3. DẢI NGÂN HÀ XOẮN ỐC (ĐÃ CĂN CHỈNH)
    // =========================================
    let mainCanvas = document.getElementById('main-canvas');
    let mainCtx = mainCanvas.getContext('2d');
    let galaxyStars = [];
    let journeyActive = false;
    let centerX, centerY; // Biến lưu tâm màn hình

    function startGalaxySequence() {
        openingScreen.style.transition = "opacity 2s ease";
        openingScreen.style.opacity = 0;
        
        setTimeout(() => {
            openingScreen.classList.add('hidden');
            isIntroActive = false; 

            mainJourney.classList.remove('hidden');
            mainJourney.classList.add('visible');
            
            initGalaxy();
        }, 2000);
    }

    function initGalaxy() {
        journeyActive = true;
        mainCanvas.width = window.innerWidth * window.devicePixelRatio;
        mainCanvas.height = window.innerHeight * window.devicePixelRatio;
        mainCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        // CĂN GIỮA TUYỆT ĐỐI
        centerX = window.innerWidth / 2;
        centerY = window.innerHeight / 2;

        galaxyStars = [];
        const starCount = 2000; 
        
        for (let i = 0; i < starCount; i++) {
            galaxyStars.push(new GalaxyStar());
        }

        const finalContainer = document.getElementById('journey-text-container');
        finalContainer.innerHTML = '';
        const h1 = document.createElement('h1');
        h1.innerText = "My Universe";
        h1.style.cssText = "font-family:'Parisienne'; color:#e0c097; font-size:3.5rem; text-shadow:0 0 25px rgba(224,192,151,0.8); margin-bottom:10px; opacity:0; transition:opacity 3s ease 1s; pointer-events:none;";
        
        const p = document.createElement('p');
        p.innerText = "Where you shine the brightest.";
        p.style.cssText = "font-family:'Inter'; color:#fff; font-size:1.1rem; opacity:0; letter-spacing:3px; text-transform: uppercase; transition:opacity 3s ease 2s; pointer-events:none;";
        
        finalContainer.style.position = 'absolute';
        finalContainer.style.top = '50%';
        finalContainer.style.left = '50%';
        finalContainer.style.transform = 'translate(-50%, -50%)';
        finalContainer.style.textAlign = 'center';
        finalContainer.style.width = '100%';
        finalContainer.style.zIndex = '100'; 
        
        finalContainer.appendChild(h1);
        finalContainer.appendChild(p);

        setTimeout(() => { h1.style.opacity = 1; p.style.opacity = 0.9; }, 500);

        renderGalaxyLoop();
    }

    class GalaxyStar {
        constructor() {
            this.reset();
        }
        reset() {
            this.angle = Math.random() * Math.PI * 2;
            this.distance = Math.random(); 
            // Tạo hình xoắn ốc Logarit
            this.spiralAngle = this.distance * Math.PI * 4; 
            
            // Màu sắc lung linh (Tím, Hồng, Xanh)
            const colors = ["#ff9a9e", "#a18cd1", "#fad0c4", "#fbc2eb", "#a6c1ee", "#ffffff"];
            this.color = colors[Math.floor(Math.random() * colors.length)];
            
            this.size = Math.random() * 2;
            this.speed = (1 - this.distance) * 0.002 + 0.0005; 
            this.blinkSpeed = Math.random() * 0.05;
        }
        
        update() {
            this.angle += this.speed;
        }
        
        draw() {
            // Giới hạn bán kính theo chiều ngang màn hình (điện thoại) để không bị cắt
            // Lấy 90% chiều rộng màn hình chia 2
            const maxRadius = Math.min(window.innerWidth, window.innerHeight) * 0.45; 
            const r = this.distance * maxRadius;
            
            const x = centerX + Math.cos(this.angle + this.spiralAngle) * r;
            // Ép dẹt một chút theo chiều dọc để tạo góc nhìn 3D
            const y = centerY + Math.sin(this.angle + this.spiralAngle) * r * 0.85; 

            const alpha = 0.5 + Math.sin(Date.now() * 0.005 + this.blinkSpeed * 100) * 0.5;

            mainCtx.globalCompositeOperation = "lighter";
            mainCtx.fillStyle = this.color;
            mainCtx.globalAlpha = alpha * (1 - this.distance * 0.6); 
            
            mainCtx.beginPath();
            mainCtx.arc(x, y, this.size, 0, Math.PI * 2);
            mainCtx.fill();
        }
    }

    function renderGalaxyLoop() {
        if (!journeyActive) return;

        mainCtx.globalCompositeOperation = "source-over";
        mainCtx.fillStyle = "rgba(5, 5, 16, 0.2)"; 
        mainCtx.fillRect(0, 0, window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);

        galaxyStars.forEach(star => {
            star.update();
            star.draw();
        });

        // Vẽ Core sáng ở giữa
        const gradient = mainCtx.createRadialGradient(centerX, centerY, 0, centerX, centerY, window.innerWidth * 0.15);
        gradient.addColorStop(0, "rgba(255, 230, 200, 0.15)");
        gradient.addColorStop(1, "rgba(0,0,0,0)");
        mainCtx.fillStyle = gradient;
        mainCtx.globalCompositeOperation = "lighter";
        mainCtx.beginPath();
        mainCtx.arc(centerX, centerY, window.innerWidth * 0.2, 0, Math.PI*2);
        mainCtx.fill();

        requestAnimationFrame(renderGalaxyLoop);
    }
});
