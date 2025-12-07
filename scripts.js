document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================
    // CONFIGURATION
    // ==========================================================
    const CONFIG = {
        NUM_FAR_STARS: 300,     // Sao nền (Far: ít chuyển động)
        NUM_NEAR_STARS: 150,   // Sao gần (Near: chuyển động Parallax mạnh)
        DRIFT_SPEED_FAR: 0.15,
        DRIFT_SPEED_NEAR: 0.35,
        TAP_THRESHOLD: 40,     // Khoảng cách chạm sao
        TOTAL_TAPS_NEEDED: 10,
        FADE_DURATION: 1500, // Thời gian chuyển cảnh (ms)
    };

    // ==========================================================
    // CORE ELEMENTS & STATE
    // ==========================================================
    const canvas = document.getElementById('phase1Background');
    const ctx = canvas.getContext('2d');
    const textElement = document.getElementById('phase1Text');
    const nextButton = document.getElementById('phase1Next');
    const startButton = document.getElementById('startButton');
    const overlay = document.getElementById('permissionOverlay');
    const mainContainer = document.getElementById('universe-container');

    const bgMusic = document.getElementById('backgroundMusic');
    const sfxTap = document.getElementById('sfxTap');

    let currentPhase = 1;
    let tapProgress = 0;
    let farStars = [];
    let nearStars = [];
    let targetStar = null;
    let orientation = { beta: 0, gamma: 0 };
    let isOrientationGranted = false;
    let lastTime = 0;

    // Dữ liệu các Phase
    const PHASES = {
        1: { text: "Chào mừng đến với vũ trụ, người yêu bé bỏng của anh. Em hãy chạm vào các vì sao để khám phá nhé.", button: true },
        2: { text: "Mỗi ngôi sao là một kỷ niệm. Hãy chạm 10 lần vào Ngôi Sao Định Mệnh để mở cánh cửa tiếp theo.", button: false },
        3: { text: "Đây là Dải Ngân Hà của riêng chúng ta. Luôn nhớ rằng, anh yêu em nhiều hơn số sao trên trời.", button: false },
    };

    // ==========================================================
    // HAPTIC & AUDIO UTILITIES
    // ==========================================================

    /** Kích hoạt rung nhẹ trên thiết bị di động (VIP Touch) */
    function triggerHapticFeedback(duration = 50) {
        if (navigator.vibrate) {
            navigator.vibrate(duration);
        }
    }

    /** Phát SFX tương tác */
    function playSfx(audioElement) {
        audioElement.currentTime = 0;
        audioElement.play().catch(e => console.log("Lỗi phát SFX:", e));
    }

    // ==========================================================
    // DEVICE MOTION & PERMISSION
    // ==========================================================

    /** Xử lý cảm biến nghiêng của điện thoại */
    function handleOrientation(event) {
        // Chuẩn hóa giá trị beta và gamma về khoảng -1 đến 1
        orientation.beta = (event.beta || 0) / 90;  // Nghiêng trước-sau
        orientation.gamma = (event.gamma || 0) / 90; // Nghiêng trái-phải
    }

    /** Xử lý Yêu cầu quyền (Quan trọng cho iOS 13+) */
    function requestMotionPermission() {
        // 1. Xử lý quyền Device Motion
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', handleOrientation, true);
                        isOrientationGranted = true;
                    }
                    transitionToUniverse();
                })
                .catch(transitionToUniverse); // Nếu lỗi, vẫn chuyển cảnh
        } else {
            // Trình duyệt không cần yêu cầu quyền (Desktop/Android)
            window.addEventListener('deviceorientation', handleOrientation, true);
            isOrientationGranted = true;
            transitionToUniverse();
        }

        // 2. Phát nhạc nền (chỉ được phép sau click)
        bgMusic.volume = 0.5;
        bgMusic.play().catch(e => console.warn("Lỗi tự động phát nhạc:", e));
        triggerHapticFeedback(100); // Rung mạnh khi bắt đầu
    }

    /** Ẩn Overlay và Hiện Canvas */
    function transitionToUniverse() {
        overlay.classList.add('hidden');
        mainContainer.style.opacity = 1;
        setTimeout(() => {
            overlay.style.display = 'none'; // Xóa hẳn khỏi DOM
        }, 800);
    }

    // ==========================================================
    // CANVAS GRAPHICS
    // ==========================================================

    /** Khởi tạo mảng Ngôi Sao */
    function initStars(num, driftSpeed, isNear) {
        const stars = [];
        for (let i = 0; i < num; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                baseRadius: isNear ? Math.random() * 1.5 + 1.2 : Math.random() * 0.8 + 0.5,
                driftY: driftSpeed * (Math.random() * 0.5 + 0.7),
                twinklePhase: Math.random() * Math.PI * 2,
                parallaxFactor: isNear ? 1.0 : 0.4, // Hệ số Parallax
            });
        }
        return stars;
    }

    /** Vẽ Ngôi Sao Định Mệnh (Mục tiêu của Phase 2) */
    function drawTargetStar() {
        if (!targetStar) return;

        const r = targetStar.baseRadius * 1.2;
        const glowIntensity = (tapProgress / CONFIG.TOTAL_TAPS_NEEDED) * 0.6 + 0.4;
        
        // Hiệu ứng Halo (Vòng sáng lớn)
        const haloR = r * 8;
        const grad = ctx.createRadialGradient(targetStar.x, targetStar.y, 0, targetStar.x, targetStar.y, haloR);
        grad.addColorStop(0, `rgba(255, 180, 255, ${glowIntensity * 0.4})`); // Màu hồng tím lãng mạn
        grad.addColorStop(0.5, `rgba(255, 180, 255, ${glowIntensity * 0.15})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(targetStar.x, targetStar.y, haloR, 0, Math.PI * 2);
        ctx.fill();

        // Lõi Sao (Core)
        ctx.fillStyle = `rgba(255, 255, 255, ${glowIntensity * 0.9})`;
        ctx.beginPath();
        ctx.arc(targetStar.x, targetStar.y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    /** Vẽ và cập nhật toàn bộ Ngôi Sao (Bao gồm Parallax) */
    function drawStars(time) {
        const w = canvas.width;
        const h = canvas.height;
        const t = time * 0.001;
        const parallaxX = orientation.gamma * 40;  // Độ dịch chuyển tối đa Parallax
        const parallaxY = orientation.beta * 40;

        // --- 1. FAR STARS (Lớp nền sâu, ít Parallax) ---
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        farStars.forEach(s => {
            // Cập nhật vị trí trôi dạt
            s.y += s.driftY;
            if (s.y > h + 5) s.y = -5;
            
            // Twinkle (Nhấp nháy phức tạp)
            const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + s.twinklePhase));
            const r = s.baseRadius * tw;
            
            ctx.beginPath();
            // Áp dụng Parallax (nhân với Factor thấp)
            ctx.arc(s.x + parallaxX * s.parallaxFactor, s.y + parallaxY * s.parallaxFactor, r, 0, Math.PI * 2);
            ctx.fill();
        });

        // --- 2. NEAR STARS (Lớp gần, Parallax mạnh) ---
        nearStars.forEach(s => {
            s.y += s.driftY;
            if (s.y > h + 8) s.y = -8;

            // Twinkle
            const tw = 0.6 + 0.4 * Math.abs(Math.sin(t * 1.6 + s.twinklePhase));
            const r = s.baseRadius * tw;

            // Vẽ Hào quang (Ánh sáng tỏa ra)
            const haloR = r * 4;
            const grad = ctx.createRadialGradient(s.x + parallaxX, s.y + parallaxY, 0, s.x + parallaxX, s.y + parallaxY, haloR);
            grad.addColorStop(0, "rgba(255,255,255,0.25)");
            grad.addColorStop(1, "rgba(255,255,255,0.0)");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(s.x + parallaxX, s.y + parallaxY, haloR, 0, Math.PI * 2);
            ctx.fill();

            // Vẽ Lõi Sao (Core)
            ctx.fillStyle = "rgba(255,255,255,0.95)";
            ctx.beginPath();
            ctx.arc(s.x + parallaxX, s.y + parallaxY, r, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Vẽ Ngôi sao Định Mệnh (chỉ trong Phase 2)
        if (currentPhase === 2) {
            ctx.save();
            // Dịch chuyển Target Star theo Parallax của lớp gần
            ctx.translate(parallaxX, parallaxY); 
            drawTargetStar();
            ctx.restore();
        }
    }

    /** Vòng lặp chính của Canvas */
    function update(time) {
        const dt = time - lastTime;
        lastTime = time;

        // Xóa canvas
        ctx.fillStyle = '#020118';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Vẽ các ngôi sao
        drawStars(time);

        requestAnimationFrame(update);
    }

    // ==========================================================
    // PHASE & INTERACTION LOGIC
    // ==========================================================

    /** Chuyển đổi giữa các Phase */
    function goToNextPhase() {
        if (currentPhase >= Object.keys(PHASES).length) return;

        triggerHapticFeedback(40);
        
        // 1. Bắt đầu hiệu ứng chuyển cảnh (mờ dần)
        textElement.style.opacity = 0;
        nextButton.classList.remove('visible');

        // 2. Đợi chuyển cảnh
        setTimeout(() => {
            currentPhase++;
            const nextPhase = PHASES[currentPhase];

            // 3. Cập nhật nội dung
            textElement.textContent = nextPhase.text;
            
            // 4. Hiển thị UI mới
            if (nextPhase.button) {
                nextButton.classList.add('visible');
            }
            
            // Tạo Target Star ngẫu nhiên cho Phase 2
            if (currentPhase === 2) {
                targetStar = {
                    x: canvas.width / 2 + (Math.random() - 0.5) * 100, // Gần giữa màn hình
                    y: canvas.height / 2 + (Math.random() - 0.5) * 100,
                    baseRadius: 6,
                };
            }

            // 5. Kết thúc hiệu ứng chuyển cảnh (mờ hiện)
            textElement.style.opacity = 1;
        }, CONFIG.FADE_DURATION / 2);
    }

    /** Xử lý sự kiện chạm/click */
    function handleTap(event) {
        if (currentPhase !== 2 || !targetStar) return;

        // Lấy tọa độ chạm (xử lý cả Touch và Mouse)
        const rect = canvas.getBoundingClientRect();
        const clientX = event.clientX || event.touches[0].clientX;
        const clientY = event.clientY || event.touches[0].clientY;

        // Chuyển đổi tọa độ màn hình sang tọa độ Canvas
        const x = (clientX - rect.left) * (canvas.width / rect.width);
        const y = (clientY - rect.top) * (canvas.height / rect.height);

        // Tính toán vị trí Target Star đã bị dịch chuyển bởi Parallax
        const parallaxX = orientation.gamma * 40;  
        const parallaxY = orientation.beta * 40;
        const targetX = targetStar.x + parallaxX;
        const targetY = targetStar.y + parallaxY;

        // Kiểm tra khoảng cách
        const dist = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2));

        if (dist < CONFIG.TAP_THRESHOLD) {
            tapProgress++;
            playSfx(sfxTap);
            triggerHapticFeedback(60); // Rung khi chạm đúng

            textElement.textContent = `Ngôi Sao Định Mệnh: ${tapProgress}/${CONFIG.TOTAL_TAPS_NEEDED} lần chạm`;

            if (tapProgress >= CONFIG.TOTAL_TAPS_NEEDED) {
                goToNextPhase();
                canvas.removeEventListener('click', handleTap);
                canvas.removeEventListener('touchstart', handleTap);
            }
        } else {
            triggerHapticFeedback(10); // Rung nhẹ khi chạm sai
        }
    }
    
    // ==========================================================
    // INIT & EVENT LISTENERS
    // ==========================================================

    /** Khởi tạo ban đầu */
    function init() {
        // Đảm bảo canvas lấp đầy viewport
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        // Khởi tạo ngôi sao
        farStars = initStars(CONFIG.NUM_FAR_STARS, CONFIG.DRIFT_SPEED_FAR, false);
        nearStars = initStars(CONFIG.NUM_NEAR_STARS, CONFIG.DRIFT_SPEED_NEAR, true);

        // Load Phase 1
        textElement.textContent = PHASES[1].text;
        nextButton.classList.add('visible'); // Nút Next mặc định hiện trong Phase 1

        // Bắt đầu vòng lặp vẽ
        requestAnimationFrame(update);
    }

    // Listeners
    startButton.addEventListener('click', requestMotionPermission);
    nextButton.addEventListener('click', goToNextPhase);
    
    // Listener cho Phase 2 (Chạm)
    canvas.addEventListener('click', handleTap);
    canvas.addEventListener('touchstart', handleTap);
    
    window.addEventListener('resize', init); // Xử lý khi xoay ngang điện thoại

    init();
});
