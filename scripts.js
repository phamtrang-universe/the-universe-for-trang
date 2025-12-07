document.addEventListener('DOMContentLoaded', () => {
    // --- CẤU HÌNH ---
    const ACCESS_CODE = "161103";
    
    // --- DOM ELEMENTS ---
    const gateScreen = document.getElementById('gate-screen');
    const passInput = document.getElementById('pass-input');
    const unlockBtn = document.getElementById('unlock-btn');
    const errorMsg = document.getElementById('error-msg');
    const openingScreen = document.getElementById('opening-screen');
    const introCanvas = document.getElementById('intro-canvas');
    const subtitle = document.getElementById('opening-subtitle');
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
        speed: 0.025          
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

    if (unlockBtn) {
        unlockBtn.addEventListener('click', (e) => {
            e.preventDefault();
            checkPassword();
        });
    }
    
    if (passInput) {
        passInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkPassword();
        });
    }

    function unlockUniverse() {
        if(bgMusic) { bgMusic.volume = 0.6; bgMusic.play().catch(()=>{}); }

        gateScreen.style.transition = "opacity 1s ease";
        gateScreen.style.opacity = 0;
        
        setTimeout(() => {
            gateScreen.style.display = 'none';
            openingScreen.classList.remove('hidden');
            setTimeout(() => openingScreen.classList.add('visible'), 50);

            isIntroActive = true;
            resize();
            initBackgroundStars();
            renderIntro();       
        }, 1000); 
    }

    // =========================================
    // 2. HỆ THỐNG ĐỒ HỌA (VẼ TỰ ĐỘNG)
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
            y: (h * 0.1) + (p.y) * (h * 0.8),
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
                onConstellationComplete();
            }
        }

        if (drawState.progress > 0) {
            introCtx.save(); introCtx.beginPath();
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

    // --- XỬ LÝ CHẠM (Đã tăng độ nhạy) ---
    introCanvas.addEventListener('pointerdown', (e) => {
        if (drawState.started) return;
        const rect = introCanvas.getBoundingClientRect();
        const scaleX = introCanvas.width / rect.width;
        const scaleY = introCanvas.height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;
        const target = constellation[0];
        const dist = Math.hypot(clickX - target.x, clickY - target.y);

        // Tăng vùng chạm lên 80px (đã nhân tỉ lệ màn hình) cho dễ bấm
        if (dist < 80 * window.devicePixelRatio) {
            drawState.started = true;
            subtitle.style.opacity = 0;
            setTimeout(() => {
                subtitle.innerText = "Watching the stars align for you...";
                subtitle.style.opacity = 1;
            }, 500);
        }
    });

    function onConstellationComplete() {
        setTimeout(() => { transitionToMainJourney(); }, 2000);
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

        const finalContainer = document.getElementById('journey-text-container');
        finalContainer.innerHTML = '';
        
        const h1 = document.createElement('h1');
        h1.innerText = "My Universe";
        h1.style.cssText = "font-family:'Parisienne'; color:#e0c097; font-size:3rem; text-shadow:0 0 15px rgba(224,192,151,0.5); margin-bottom:10px; opacity:0; transition:opacity 3s ease 1s;";
        
        const p = document.createElement('p');
        p.innerText = "Where you shine the brightest.";
        p.style.cssText = "font-family:'Inter'; color:#fff; font-size:1rem; opacity:0; letter-spacing:2px; transition:opacity 3s ease 2s;";
        
        finalContainer.style.position = 'absolute';
        finalContainer.style.top = '50%';
        finalContainer.style.left = '50%';
        finalContainer.style.transform = 'translate(-50%, -50%)';
        finalContainer.style.textAlign = 'center';
        finalContainer.style.pointerEvents = 'none';
        finalContainer.appendChild(h1);
        finalContainer.appendChild(p);

        setTimeout(() => { h1.style.opacity = 1; p.style.opacity = 0.8; }, 500);
        renderGalaxy();
    }

    class GalaxyParticle {
        constructor() {
            this.w = window.innerWidth; this.h = window.innerHeight; this.reset();
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
            mainCtx.globalCompositeOperation = "lighter"; mainCtx.fillStyle = this.color;
            mainCtx.globalAlpha = 1 - (this.radius / (Math.min(this.w,this.h)*0.6)); 
            mainCtx.beginPath(); mainCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2); mainCtx.fill();
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
        shootingStars.forEach((s, i) => { s.update(); s.draw(); if (s.opacity <= 0) shootingStars.splice(i, 1); });
        requestAnimationFrame(renderGalaxy);
    }
});
