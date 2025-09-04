// script.js (Corrected Code)
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