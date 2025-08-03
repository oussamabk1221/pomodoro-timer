class PomodoroTimer {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentTime = 45 * 60; // 45 minutes in seconds
        this.totalTime = 45 * 60;
        this.isBreak = false;
        this.sessionCount = 0;
        this.totalFocusTime = 0;
        this.interval = null;
        
        this.initializeElements();
        this.initializeStarfield();
        this.initializeCursorGlow();
        this.bindEvents();
        this.updateDisplay();
        this.updateClock();
        this.startClockInterval();
        
        // Load saved data
        this.loadData();
    }
    
    initializeElements() {
        this.timerDisplay = document.getElementById('timer-display');
        this.timerLabel = document.getElementById('timer-label');
        this.timerPhase = document.getElementById('timer-phase');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.progressRing = document.querySelector('.progress-ring-fill');
        this.timerCircle = document.querySelector('.timer-circle');
        this.pandaCelebration = document.getElementById('panda-celebration');
        this.notificationSound = document.getElementById('notification-sound');
        this.currentTimeEl = document.getElementById('current-time');
        this.currentDateEl = document.getElementById('current-date');
        this.headerTimeEl = document.getElementById('header-time');
        this.timerStatusEl = document.getElementById('timer-status');
        this.breakStatusEl = document.getElementById('break-status');
        this.sessionsCountEl = document.getElementById('sessions-count');
        this.focusTimeEl = document.getElementById('focus-time');
        
        // Calculate progress ring circumference
        const radius = 140;
        this.circumference = 2 * Math.PI * radius;
        this.progressRing.style.strokeDasharray = this.circumference;
    }
    
    initializeStarfield() {
        const starfield = document.getElementById('starfield');
        const starCount = 150;
        
        for (let i = 0; i < starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            // Random size
            const sizes = ['small', 'medium', 'large'];
            const size = sizes[Math.floor(Math.random() * sizes.length)];
            star.classList.add(size);
            
            // Random color
            const colors = ['blue', 'white'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            star.classList.add(color);
            
            // Random position
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            
            // Random animation delay
            star.style.animationDelay = Math.random() * 3 + 's';
            
            starfield.appendChild(star);
        }
        
        // Add shooting stars periodically
        setInterval(() => {
            this.createShootingStar();
        }, 5000);
    }
    
    createShootingStar() {
        const starfield = document.getElementById('starfield');
        const shootingStar = document.createElement('div');
        shootingStar.className = 'shooting-star';
        
        // Random starting position
        shootingStar.style.left = Math.random() * 100 + '%';
        shootingStar.style.top = Math.random() * 100 + '%';
        
        starfield.appendChild(shootingStar);
        
        // Remove after animation
        setTimeout(() => {
            if (shootingStar.parentNode) {
                shootingStar.parentNode.removeChild(shootingStar);
            }
        }, 3000);
    }
    
    initializeCursorGlow() {
        const cursorGlow = document.getElementById('cursor-glow');
        
        document.addEventListener('mousemove', (e) => {
            const x = e.clientX - 150; // Center the glow
            const y = e.clientY - 150;
            
            cursorGlow.style.transform = `translate(${x}px, ${y}px)`;
            
            // Add interactive effect to nearby stars
            this.animateNearbyStars(e.clientX, e.clientY);
        });
    }
    
    animateNearbyStars(mouseX, mouseY) {
        const stars = document.querySelectorAll('.star');
        
        stars.forEach(star => {
            const rect = star.getBoundingClientRect();
            const starX = rect.left + rect.width / 2;
            const starY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(mouseX - starX, 2) + Math.pow(mouseY - starY, 2)
            );
            
            if (distance < 100) {
                const scale = 1 + (100 - distance) / 100;
                star.style.transform = `scale(${scale})`;
                star.style.transition = 'transform 0.3s ease';
            } else {
                star.style.transform = 'scale(1)';
            }
        });
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        
        // Sidebar navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
        
        // Close panda celebration
        this.pandaCelebration.addEventListener('click', () => {
            this.hidePandaCelebration();
        });
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            
            this.timerCircle.classList.add('active');
            this.progressRing.classList.add('active');
            
            this.updateStatus();
            
            this.interval = setInterval(() => {
                this.currentTime--;
                this.updateDisplay();
                this.updateProgress();
                
                if (this.currentTime <= 0) {
                    this.complete();
                }
            }, 1000);
        }
    }
    
    pause() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            this.isRunning = false;
            
            clearInterval(this.interval);
            
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            
            this.timerCircle.classList.remove('active');
            this.progressRing.classList.remove('active');
            
            this.updateStatus();
        }
    }
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        
        clearInterval(this.interval);
        
        // Reset to appropriate time based on current mode
        this.currentTime = this.isBreak ? 15 * 60 : 45 * 60;
        this.totalTime = this.currentTime;
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        
        this.timerCircle.classList.remove('active');
        this.progressRing.classList.remove('active');
        
        this.updateDisplay();
        this.updateProgress();
        this.updateStatus();
    }
    
    complete() {
        this.isRunning = false;
        clearInterval(this.interval);
        
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        
        this.timerCircle.classList.remove('active');
        this.progressRing.classList.remove('active');
        
        // Play notification sound
        this.playNotificationSound();
        
        if (!this.isBreak) {
            // Completed a pomodoro session
            this.sessionCount++;
            this.totalFocusTime += 45;
            this.updateStats();
            
            // Show panda celebration
            this.showPandaCelebration();
            
            // Switch to break mode
            setTimeout(() => {
                this.startBreak();
            }, 3000);
        } else {
            // Completed a break
            this.startPomodoro();
        }
        
        this.saveData();
    }
    
    startBreak() {
        this.isBreak = true;
        this.currentTime = 15 * 60; // 15 minutes
        this.totalTime = this.currentTime;
        
        this.timerLabel.textContent = 'Break Time';
        this.timerPhase.textContent = 'Take a rest';
        
        this.updateDisplay();
        this.updateProgress();
        this.updateStatus();
        
        this.hidePandaCelebration();
    }
    
    startPomodoro() {
        this.isBreak = false;
        this.currentTime = 45 * 60; // 45 minutes
        this.totalTime = this.currentTime;
        
        this.timerLabel.textContent = 'Pomodoro Session';
        this.timerPhase.textContent = 'Ready to focus';
        
        this.updateDisplay();
        this.updateProgress();
        this.updateStatus();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = this.currentTime % 60;
        
        this.timerDisplay.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateProgress() {
        const progress = 1 - (this.currentTime / this.totalTime);
        const offset = this.circumference * (1 - progress);
        this.progressRing.style.strokeDashoffset = offset;
    }
    
    updateStatus() {
        if (this.isRunning) {
            this.timerStatusEl.textContent = this.isBreak ? 'Break Active' : 'Focus Time';
            this.timerPhase.textContent = this.isBreak ? 'Taking a break' : 'Focusing...';
        } else if (this.isPaused) {
            this.timerStatusEl.textContent = 'Paused';
            this.timerPhase.textContent = 'Timer paused';
        } else {
            this.timerStatusEl.textContent = 'Ready';
            this.timerPhase.textContent = this.isBreak ? 'Ready for break' : 'Ready to focus';
        }
        
        this.breakStatusEl.textContent = this.isBreak ? 'Active' : 'Waiting';
    }
    
    updateClock() {
        const now = new Date();
        
        // Update current time
        const timeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        this.currentTimeEl.textContent = timeString;
        
        // Update header time (without seconds)
        const headerTimeString = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });
        this.headerTimeEl.textContent = headerTimeString;
        
        // Update date
        const dateString = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        this.currentDateEl.textContent = dateString;
    }
    
    startClockInterval() {
        this.updateClock();
        setInterval(() => {
            this.updateClock();
        }, 1000);
    }
    
    updateStats() {
        this.sessionsCountEl.textContent = this.sessionCount;
        
        const hours = Math.floor(this.totalFocusTime / 60);
        const minutes = this.totalFocusTime % 60;
        this.focusTimeEl.textContent = `${hours}h ${minutes}m`;
    }
    
    showPandaCelebration() {
        this.pandaCelebration.classList.add('show');
        this.createConfetti();
    }
    
    hidePandaCelebration() {
        this.pandaCelebration.classList.remove('show');
    }
    
    createConfetti() {
        const confettiContainer = document.querySelector('.confetti');
        const colors = ['#3b82f6', '#f97316', '#10b981', '#f59e0b', '#ef4444'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'absolute';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.borderRadius = '50%';
            confetti.style.animation = `fall ${Math.random() * 3 + 2}s ease-in-out`;
            
            confettiContainer.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 5000);
        }
        
        // Add fall animation dynamically
        if (!document.getElementById('fall-animation')) {
            const style = document.createElement('style');
            style.id = 'fall-animation';
            style.textContent = `
                @keyframes fall {
                    to {
                        transform: translateY(100vh) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    playNotificationSound() {
        // Create a more pleasant notification sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Audio context not available');
        }
    }
    
    saveData() {
        const data = {
            sessionCount: this.sessionCount,
            totalFocusTime: this.totalFocusTime
        };
        localStorage.setItem('pomodoroData', JSON.stringify(data));
    }
    
    loadData() {
        const saved = localStorage.getItem('pomodoroData');
        if (saved) {
            const data = JSON.parse(saved);
            this.sessionCount = data.sessionCount || 0;
            this.totalFocusTime = data.totalFocusTime || 0;
            this.updateStats();
        }
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
    
    // Add some additional interactive effects
    document.addEventListener('click', (e) => {
        // Create ripple effect on clicks
        createRipple(e.pageX, e.pageY);
    });
    
    function createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.style.position = 'fixed';
        ripple.style.left = x - 25 + 'px';
        ripple.style.top = y - 25 + 'px';
        ripple.style.width = '50px';
        ripple.style.height = '50px';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(59, 130, 246, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.pointerEvents = 'none';
        ripple.style.zIndex = '9999';
        
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            document.body.removeChild(ripple);
        }, 600);
    }
    
    // Add ripple animation
    if (!document.getElementById('ripple-animation')) {
        const style = document.createElement('style');
        style.id = 'ripple-animation';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
});