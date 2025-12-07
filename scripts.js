// ... (Giữ nguyên phần trên của file scripts.js)

    // =========================================
    // 3. CHUYỂN CẢNH CUỐI: DẢI NGÂN HÀ (THE GALAXY)
    // =========================================
    
    // Biến cho Galaxy
    let mainCanvas = document.getElementById('main-canvas');
    let mainCtx = mainCanvas.getContext('2d');
    let galaxyParticles = [];
    let shootingStars = [];
    let journeyActive = false;

    function transitionToMainJourney() {
        // Fade out màn hình Intro
        openingScreen.style.transition = "opacity 2s ease";
        openingScreen.style.opacity = 0;
        
        setTimeout(() => {
            openingScreen.classList.add('hidden');
            isIntroActive = false; // Dừng vẽ intro để tiết kiệm pin

            mainJourney.classList.remove('hidden');
            setTimeout(() => mainJourney.classList.add('visible'), 100);
            
            // Khởi động Galaxy
            initMainJourney();
        }, 2000);
    }

    function initMainJourney() {
        journeyActive = true;
        
        // Resize main canvas
        mainCanvas.width = window.innerWidth * window.devicePixelRatio;
        mainCanvas.height = window.innerHeight * window.devicePixelRatio;
        mainCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        // Tạo hạt Galaxy
        for(let i=0; i<800; i++) {
            galaxyParticles.push(new GalaxyParticle());
        }

        // Hiện lời nhắn cuối cùng
        const finalMsg = document.createElement('div');
        finalMsg.innerHTML = `
            <h1 style="font-family:'Parisienne'; color:#e0c097; font-size:2.5rem; text-shadow:0 0 15px rgba(224,192,151,0.5); margin-bottom:10px">My Universe</h1>
            <p style="font-family:'Inter'; color:#fff; font-size:1rem; opacity:0.8; letter-spacing:1px">Where you shine the brightest.</p>
        `;
        finalMsg.style.position = 'absolute';
        finalMsg.style.top = '50%';
        finalMsg.style.left = '50%';
        finalMsg.style.transform = 'translate(-50%, -50%)';
        finalMsg.style.textAlign = 'center';
        finalMsg.style.opacity = '0';
        finalMsg.style.transition = 'opacity 3s ease 1s';
        
        mainJourney.appendChild(finalMsg);
        
        // Hiện chữ sau 1s
        setTimeout(() => finalMsg.style.opacity = 1, 1000);

        renderGalaxy();
    }

    // --- CLASS HẠT NGÂN HÀ ---
    class GalaxyParticle {
        constructor() {
            this.w = window.innerWidth;
            this.h = window.innerHeight;
            this.reset();
            // Màu: Xanh dương, Tím, Hồng, Trắng
            const colors = ["#a8c7ff", "#c4a8ff", "#ffacd8", "#ffffff"];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        reset() {
            this.angle = Math.random() * Math.PI * 2;
            // Bán kính xoắn ốc
            this.radius = Math.random() * (Math.min(this.w, this.h) * 0.45); 
            this.size = Math.random() * 1.2 + 0.1;
            this.speed = (1 / this.radius) * 50 + 0.02; // Gần tâm quay nhanh hơn
        }
        update() {
            this.angle += this.speed * 0.0005; 
            this.x = this.w / 2 + Math.cos(this.angle) * this.radius;
            this.y = this.h / 2 + Math.sin(this.angle) * this.radius * 0.8; // Hơi dẹt (Elip)
        }
        draw() {
            mainCtx.globalCompositeOperation = "lighter";
            mainCtx.fillStyle = this.color;
            // Mờ dần khi ra xa tâm
            mainCtx.globalAlpha = 1 - (this.radius / (Math.min(this.w,this.h)*0.55)); 
            mainCtx.beginPath();
            mainCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            mainCtx.fill();
        }
    }

    // --- SAO BĂNG ---
    class ShootingStar {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight * 0.5;
            this.len = Math.random() * 80 + 20;
            this.speed = Math.random() * 5 + 5;
            this.size = Math.random() * 1 + 0.1;
            this.angle = Math.PI / 4 + (Math.random() * 0.2); // Góc chéo 45 độ
            this.opacity = 1;
        }
        update() {
            this.x += this.speed * Math.cos(this.angle);
            this.y += this.speed * Math.sin(this.angle);
            this.opacity -= 0.015;
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

    // --- RENDER LOOP CHO GALAXY ---
    function renderGalaxy() {
        if (!journeyActive) return;

        mainCtx.globalCompositeOperation = "source-over";
        mainCtx.fillStyle = "rgba(5, 5, 16, 0.2)"; // Tạo vệt mờ (trails)
        mainCtx.fillRect(0, 0, window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);

        // Vẽ Galaxy
        galaxyParticles.forEach(p => { p.update(); p.draw(); });

        // Vẽ Sao Băng ngẫu nhiên
        if (Math.random() < 0.05 && shootingStars.length < 4) {
            shootingStars.push(new ShootingStar());
        }
        shootingStars.forEach((s, i) => {
            s.update(); s.draw();
            if (s.opacity <= 0) shootingStars.splice(i, 1);
        });

        requestAnimationFrame(renderGalaxy);
    }

    // Init Intro
    initBackgroundStars();
});
