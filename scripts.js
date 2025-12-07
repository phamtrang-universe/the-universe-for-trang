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
    
    // Các element cho màn hình cuối
    const finalImg = document.getElementById('final-constellation-img');
    const finalTitle = document.getElementById('final-title');
    const finalSubtitle = document.getElementById('final-subtitle');

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
        speed: 0.02 
    };

    // 1. XỬ LÝ MẬT MÃ
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

        gateScreen.style.opacity = 0;
        setTimeout(() => {
            gateScreen.style.display = 'none';
            openingScreen.classList.remove('hidden');
            setTimeout(() => openingScreen.classList.add('visible'), 50);

            isIntroActive = true;
            resize();
            initBackgroundStars();
            renderIntro();
            
            // TỰ ĐỘNG BẮT ĐẦU VẼ SAU 1.5 GIÂY
            setTimeout(() => {
                drawState.started = true;
            }, 1500);

        }, 1200);
    }

    // 2. HỆ THỐNG INTRO (BỌ CẠP)
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
                setTimeout(transitionToMainJourney, 1500); 
            }
        }

        if (drawState.progress > 0) {
            introCtx.save();
            introCtx.beginPath();
            introCtx.strokeStyle = "rgba(224, 192, 151, 0.6)"; introCtx.lineWidth = 1.5;
            introCtx.shadowBlur = 10; introCtx.shadowColor = "rgba(224, 192, 151, 0.8)";
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

    // 3. GALAXY ENDING (ĐÃ CĂN GIỮA)
    let mainCanvas = document.getElementById('main-canvas');
    let mainCtx = mainCanvas.getContext('2d');
    let galaxyParticles = [];
    let journeyActive = false;
    let centerX, centerY;

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
        resizeMainCanvas();
        window.addEventListener('resize', resizeMainCanvas);

        for(let i=0; i<800; i++) galaxyParticles.push(new GalaxyParticle());

        // Hiện các element nội dung cuối
        setTimeout(() => { finalImg.style.opacity = 1; }, 500);
        setTimeout(() => { finalTitle.style.opacity = 1; }, 1500);
        setTimeout(() => { finalSubtitle.style.opacity = 1; }, 2500);

        renderGalaxy();
    }

    function resizeMainCanvas() {
        mainCanvas.width = window.innerWidth * window.devicePixelRatio;
        mainCanvas.height = window.innerHeight * window.devicePixelRatio;
        mainCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        // Cập nhật tâm màn hình khi resize
        centerX = window.innerWidth / 2;
        centerY = window.innerHeight / 2;
    }

    class GalaxyParticle {
        constructor() {
            this.reset();
        }
        reset() {
            this.angle = Math.random() * Math.PI * 2;
            this.radius = Math.random() * (Math.min(window.innerWidth, window.innerHeight) * 0.45); 
            this.size = Math.random() * 1.5 + 0.1;
            this.speed = (1 / this.radius) * 40 + 0.01;
            // Màu sắc ngẫu nhiên
            const colors = ["#e0c097", "#ffffff", "#a8c7ff", "#ffacd8"];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        update() {
            this.angle += this.speed * 0.0005; 
            // Tính toán vị trí dựa trên tâm màn hình (centerX, centerY)
            this.x = centerX + Math.cos(this.angle) * this.radius;
            this.y = centerY + Math.sin(this.angle) * this.radius * 0.8; 
        }
        draw() {
            mainCtx.globalCompositeOperation = "lighter"; 
            mainCtx.fillStyle = this.color;
            mainCtx.globalAlpha = 1 - (this.radius / (Math.min(window.innerWidth, window.innerHeight)*0.6)); 
            mainCtx.beginPath(); mainCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2); mainCtx.fill();
        }
    }

    function renderGalaxy() {
        if (!journeyActive) return;
        mainCtx.globalCompositeOperation = "source-over";
        mainCtx.fillStyle = "rgba(5, 5, 16, 0.2)"; 
        mainCtx.fillRect(0, 0, window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
        galaxyParticles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(renderGalaxy);
    }
});
