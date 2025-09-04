document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION ---
    const birthday = new Date("2025-09-25T00:00:00+05:30").getTime();
    const unlockStartDate = new Date("2025-09-04T00:00:00+05:30").getTime();
    let messages = [];

    // --- DOM ELEMENTS ---
    const countdownEl = document.getElementById("countdown");
    const messageEl = document.getElementById("message");
    const imageEl = document.getElementById("image");
    const dailyMessageCard = document.getElementById("dailyMessage");
    const galleryContainer = document.getElementById("galleryContainer");
    const toggleGalleryBtn = document.getElementById("toggleGallery");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    
    // --- STATE ---
    let unlockedCount = 0;
    let currentIndex = 0;
    let galleryTimerInterval = null;

    // --- FUNCTIONS ---
    function updateCountdown() {
        const now = new Date().getTime();
        const diff = birthday - now;

        if (diff <= 0) {
            countdownEl.innerHTML = "🎉 Happy Birthday! 🎉";
            launchConfetti();
            if(this.intervalId) clearInterval(this.intervalId);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        countdownEl.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    function updateUnlocks() {
        const now = new Date().getTime();
        const daysPassed = Math.floor((now - unlockStartDate) / (1000 * 60 * 60 * 24));
        let newUnlockedCount = daysPassed + 1;
        
        newUnlockedCount = Math.max(0, Math.min(newUnlockedCount, messages.length));

        if (newUnlockedCount !== unlockedCount) {
            unlockedCount = newUnlockedCount;
            currentIndex = unlockedCount > 0 ? unlockedCount - 1 : 0;
            updateMessage();
            if (galleryContainer.style.display !== 'none' && galleryContainer.style.display !== '') {
                buildGallery();
                if (galleryTimerInterval) clearInterval(galleryTimerInterval);
                updateNextGalleryTimer();
                galleryTimerInterval = setInterval(updateNextGalleryTimer, 1000);
            }
        }
    }
    
    function updateMessage() {
        dailyMessageCard.classList.remove('fade-in');
        void dailyMessageCard.offsetWidth;
        dailyMessageCard.classList.add('fade-in');

        if (unlockedCount > 0 && currentIndex < unlockedCount) {
            const msg = messages[currentIndex];
            messageEl.innerText = msg.text;
            imageEl.src = msg.img;
            imageEl.alt = `Memory for ${msg.date}`;
            imageEl.style.display = 'block';
        } else {
            messageEl.innerText = "A new surprise unlocks soon!";
            imageEl.style.display = 'none';
        }
        updateNavButtons();
    }

    function updateNavButtons() {
        prevBtn.disabled = currentIndex <= 0;
        nextBtn.disabled = currentIndex >= unlockedCount - 1 || unlockedCount === 0;
    }

    function updateNextGalleryTimer() {
        const timerEl = document.querySelector('.locked-timer');
        if (!timerEl) return;

        const now = new Date().getTime();
        const unlockTime = parseInt(timerEl.dataset.unlockDate, 10);
        const diff = unlockTime - now;

        if (diff <= 0) {
            timerEl.innerText = "Unlocking...";
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        timerEl.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }

    function buildGallery() {
        galleryContainer.innerHTML = "";
        messages.forEach((msg, i) => {
            const card = document.createElement("div");
            card.className = `p-2 rounded-lg bg-slate-800/50 transition-all duration-300 ${i >= unlockedCount ? 'opacity-50 filter grayscale' : 'cursor-pointer hover:scale-105'}`;
            
            if (i < unlockedCount) {
                card.innerHTML = `<img src="${msg.img}" alt="${msg.date}" class="rounded-md w-full aspect-square object-cover"><p class="text-xs mt-2 font-semibold text-center">${msg.date}</p>`;
                card.addEventListener('click', () => {
                    currentIndex = i;
                    updateMessage();
                    galleryContainer.style.display = "none";
                    toggleGalleryBtn.innerText = "Open Memory Gallery";
                    if (galleryTimerInterval) clearInterval(galleryTimerInterval);
                });
            } else {
                const unlockDate = new Date(unlockStartDate);
                unlockDate.setDate(unlockDate.getDate() + i);
                
                if (i === unlockedCount) {
                    card.innerHTML = `<div class="w-full aspect-square bg-white/5 rounded-md flex flex-col items-center justify-center text-center p-1"><p class="text-xs font-mono text-center locked-timer" data-unlock-date="${unlockDate.getTime()}"></p></div><p class="text-xs mt-2 font-semibold text-center">${msg.date}</p>`;
                } else {
                    card.innerHTML = `<div class="w-full aspect-square bg-white/5 rounded-md flex flex-col items-center justify-center text-center p-1"><p class="text-xs">Unlocks soon</p></div><p class="text-xs mt-2 font-semibold text-center">${msg.date}</p>`;
                }
            }
            galleryContainer.appendChild(card);
        });
    }
    
    // --- EVENT LISTENERS ---
    toggleGalleryBtn.addEventListener("click", () => {
        if (galleryContainer.style.display === "none" || galleryContainer.style.display === "") {
            buildGallery();
            galleryContainer.style.display = "grid";
            toggleGalleryBtn.innerText = "Close Memory Gallery";
            if (galleryTimerInterval) clearInterval(galleryTimerInterval);
            updateNextGalleryTimer();
            galleryTimerInterval = setInterval(updateNextGalleryTimer, 1000);
        } else {
            galleryContainer.style.display = "none";
            toggleGalleryBtn.innerText = "Open Memory Gallery";
            if (galleryTimerInterval) clearInterval(galleryTimerInterval);
        }
    });
    
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateMessage();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < unlockedCount - 1) {
            currentIndex++;
            updateMessage();
        }
    });

    let startX = 0;
    dailyMessageCard.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; });
    dailyMessageCard.addEventListener("touchend", (e) => {
        const endX = e.changedTouches[0].clientX;
        const diff = endX - startX;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && !prevBtn.disabled) { prevBtn.click(); } 
            else if (diff < 0 && !nextBtn.disabled) { nextBtn.click(); }
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft" && !prevBtn.disabled) { prevBtn.click(); } 
        else if (e.key === "ArrowRight" && !nextBtn.disabled) { nextBtn.click(); }
    });
    
    // --- INITIALIZATION LOGIC ---
    function initialize() {
        updateCountdown();
        updateUnlocks();
        this.intervalId = setInterval(updateCountdown, 1000);
        setInterval(updateUnlocks, 60000);
    }
    
    // Fetch data then initialize the application
    fetch('memories.json')
        .then(response => response.json())
        .then(data => {
            messages = data;
            initialize();
        })
        .catch(error => console.error("Could not load memories:", error));
});

// --- STARRY SKY LOGIC ---
const skyCanvas = document.getElementById("starrySkyCanvas");
const skyCtx = skyCanvas.getContext("2d");
let stars = [], shootingStars = [];
const starColors = [{ r: 244, g: 114, b: 182 }, { r: 192, g: 132, b: 252 }, { r: 96, g: 165, b: 250 }];

function setupSky() {
    skyCanvas.width = window.innerWidth;
    skyCanvas.height = window.innerHeight;
    stars = [];
    shootingStars = [];
    for (let i = 0; i < 400; i++) {
        stars.push({
            x: Math.random() * skyCanvas.width,
            y: Math.random() * skyCanvas.height,
            radius: Math.random() * 1.2,
            alpha: Math.random(),
            alphaSpeed: (Math.random() - 0.5) * 0.015,
            color: starColors[Math.floor(Math.random() * starColors.length)]
        });
    }
}

function drawSky() {
    skyCtx.clearRect(0, 0, skyCanvas.width, skyCanvas.height);
    stars.forEach(star => {
        star.alpha += star.alphaSpeed;
        if (star.alpha <= 0 || star.alpha >= 1) { star.alphaSpeed *= -1; }
        skyCtx.beginPath();
        skyCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        const color = star.color;
        skyCtx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${star.alpha})`;
        skyCtx.fill();
    });

    if (Math.random() < 0.0075) {
         shootingStars.push({
            x: Math.random() * skyCanvas.width,
            y: Math.random() * skyCanvas.height / 2,
            len: Math.random() * 120 + 60,
            speed: Math.random() * 5 + 5,
            life: 1,
            color: starColors[Math.floor(Math.random() * starColors.length)]
        });
    }

    shootingStars.forEach((ss, index) => {
        ss.x += ss.speed;
        ss.y += ss.speed;
        ss.life -= 0.01;
        if (ss.life <= 0) { shootingStars.splice(index, 1); }
        skyCtx.beginPath();
        const grad = skyCtx.createLinearGradient(ss.x, ss.y, ss.x - ss.len, ss.y - ss.len);
        const ssColor = ss.color;
        grad.addColorStop(0, `rgba(${ssColor.r}, ${ssColor.g}, ${ssColor.b}, ${ss.life})`);
        grad.addColorStop(1, `rgba(${ssColor.r}, ${ssColor.g}, ${ssColor.b}, 0)`);
        skyCtx.strokeStyle = grad;
        skyCtx.moveTo(ss.x, ss.y);
        skyCtx.lineTo(ss.x - ss.len, ss.y - ss.len);
        skyCtx.stroke();
    });

    requestAnimationFrame(drawSky);
}
window.addEventListener('resize', setupSky);
setupSky();
drawSky();

// --- CONFETTI LOGIC ---
function launchConfetti() {
    const canvas = document.getElementById("confettiCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces = [];
    const numberOfPieces = 200;
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
    const duration = 30 * 1000; // 30 seconds
    const animationEnd = Date.now() + duration;

    function createPiece() {
        return {
            x: Math.random() * canvas.width, y: -20, r: Math.random() * 8 + 5,
            dx: Math.random() * 2 - 1, dy: Math.random() * 4 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: 1, tilt: Math.random() * 10 - 5, tiltAngle: 0,
        };
    }
    for (let i = 0; i < numberOfPieces; i++) { pieces.push(createPiece()); }
    
    function loop() {
        if (Date.now() > animationEnd) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return; // Stop the animation
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach((p, i) => {
            p.x += p.dx; p.y += p.dy; p.tiltAngle += p.tilt / 20;
            ctx.save();
            ctx.globalAlpha = p.opacity;
            ctx.translate(p.x + p.r / 2, p.y + p.r / 2);
            ctx.rotate(p.tiltAngle);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r);
            ctx.restore();
            if (p.y > canvas.height) { pieces.splice(i, 1); }
        });
        
        if (pieces.length <= 0 && Date.now() > animationEnd) {
             ctx.clearRect(0, 0, canvas.width, canvas.height);
             return;
        }

        requestAnimationFrame(loop);
    }
    loop();
}