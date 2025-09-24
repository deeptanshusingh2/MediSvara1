// Breathing Timer functionality for MediSvara

let breathingTimer = null;
let breathingInterval = null;
let isBreathing = false;
let breathingPhase = 'ready'; // ready, inhale, hold, exhale
let breathingCycle = 0;
let totalTime = 0;

// Breathing parameters
const BREATHING_PATTERNS = {
    basic: { inhale: 4, hold: 4, exhale: 4 },
    relaxing: { inhale: 4, hold: 7, exhale: 8 },
    energizing: { inhale: 6, hold: 2, exhale: 4 }
};

let currentPattern = BREATHING_PATTERNS.basic;

// Initialize breathing timer
function initializeBreathingTimer() {
    setupBreathingControls();
    resetBreathingTimer();
}

// Setup breathing controls
function setupBreathingControls() {
    const startBtn = document.getElementById('start-breathing');
    const stopBtn = document.getElementById('stop-breathing');
    
    if (startBtn && stopBtn) {
        startBtn.style.display = 'inline-flex';
        stopBtn.style.display = 'none';
    }
}

// Start breathing exercise
function startBreathing() {
    if (isBreathing) return;
    
    isBreathing = true;
    breathingCycle = 0;
    totalTime = 0;
    
    // Update UI
    const startBtn = document.getElementById('start-breathing');
    const stopBtn = document.getElementById('stop-breathing');
    const breathingText = document.getElementById('breathing-text');
    
    if (startBtn && stopBtn) {
        startBtn.style.display = 'none';
        stopBtn.style.display = 'inline-flex';
    }
    
    // Start the breathing cycle
    startBreathingCycle();
    
    // Start timer display
    breathingTimer = setInterval(updateTimer, 1000);
    
    showNotification('Breathing exercise started. Follow the circle.', 'success');
}

// Stop breathing exercise
function stopBreathing() {
    if (!isBreathing) return;
    
    isBreathing = false;
    
    // Clear intervals
    if (breathingTimer) {
        clearInterval(breathingTimer);
        breathingTimer = null;
    }
    
    if (breathingInterval) {
        clearTimeout(breathingInterval);
        breathingInterval = null;
    }
    
    // Reset UI
    resetBreathingTimer();
    
    // Save session
    saveBreathingSession();
    
    showNotification(`Great job! You completed ${Math.floor(totalTime / 60)} minutes of breathing exercise.`, 'success');
}

// Start breathing cycle
function startBreathingCycle() {
    if (!isBreathing) return;
    
    breathingCycle++;
    breathingPhase = 'inhale';
    
    // Inhale phase
    updateBreathingUI('Breathe In', 'inhale');
    
    breathingInterval = setTimeout(() => {
        if (!isBreathing) return;
        
        // Hold phase
        breathingPhase = 'hold';
        updateBreathingUI('Hold', 'hold');
        
        breathingInterval = setTimeout(() => {
            if (!isBreathing) return;
            
            // Exhale phase
            breathingPhase = 'exhale';
            updateBreathingUI('Breathe Out', 'exhale');
            
            breathingInterval = setTimeout(() => {
                if (!isBreathing) return;
                
                // Pause before next cycle
                breathingPhase = 'pause';
                updateBreathingUI('Relax', 'pause');
                
                breathingInterval = setTimeout(() => {
                    startBreathingCycle(); // Start next cycle
                }, 1000);
                
            }, currentPattern.exhale * 1000);
            
        }, currentPattern.hold * 1000);
        
    }, currentPattern.inhale * 1000);
}

// Update breathing UI
function updateBreathingUI(text, phase) {
    const breathingCircle = document.getElementById('breathing-circle');
    const breathingText = document.getElementById('breathing-text');
    
    if (breathingText) {
        breathingText.textContent = text;
    }
    
    if (breathingCircle) {
        // Remove all phase classes
        breathingCircle.classList.remove('inhale', 'exhale', 'hold', 'pause');
        
        // Add current phase class
        if (phase) {
            breathingCircle.classList.add(phase);
        }
        
        // Add pulsing animation based on phase
        switch (phase) {
            case 'inhale':
                animateCircle(breathingCircle, 1.3, currentPattern.inhale * 1000);
                break;
            case 'exhale':
                animateCircle(breathingCircle, 0.8, currentPattern.exhale * 1000);
                break;
            case 'hold':
                // Keep current scale
                break;
            case 'pause':
                animateCircle(breathingCircle, 1.0, 1000);
                break;
        }
    }
}

// Animate breathing circle
function animateCircle(element, targetScale, duration) {
    element.style.transition = `transform ${duration}ms ease-in-out`;
    element.style.transform = `scale(${targetScale})`;
}

// Update timer display
function updateTimer() {
    totalTime++;
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    
    const timerDisplay = document.getElementById('timer-display');
    if (timerDisplay) {
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Auto-stop after 10 minutes
    if (totalTime >= 600) {
        stopBreathing();
        showNotification('10-minute session completed! Well done!', 'success');
    }
}

// Reset breathing timer
function resetBreathingTimer() {
    const breathingCircle = document.getElementById('breathing-circle');
    const breathingText = document.getElementById('breathing-text');
    const timerDisplay = document.getElementById('timer-display');
    const startBtn = document.getElementById('start-breathing');
    const stopBtn = document.getElementById('stop-breathing');
    
    if (breathingCircle) {
        breathingCircle.classList.remove('inhale', 'exhale', 'hold', 'pause');
        breathingCircle.style.transform = 'scale(1)';
        breathingCircle.style.transition = 'transform 0.3s ease';
    }
    
    if (breathingText) {
        breathingText.textContent = 'Click Start';
    }
    
    if (timerDisplay) {
        timerDisplay.textContent = '00:00';
    }
    
    if (startBtn && stopBtn) {
        startBtn.style.display = 'inline-flex';
        stopBtn.style.display = 'none';
    }
    
    breathingPhase = 'ready';
    breathingCycle = 0;
    totalTime = 0;
}

// Save breathing session
function saveBreathingSession() {
    const session = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        duration: totalTime,
        cycles: breathingCycle,
        pattern: 'basic', // Could be extended to track different patterns
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    const existingSessions = JSON.parse(localStorage.getItem('medisvara_breathing_sessions') || '[]');
    existingSessions.push(session);
    
    // Keep only last 30 sessions
    if (existingSessions.length > 30) {
        existingSessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        existingSessions.splice(30);
    }
    
    localStorage.setItem('medisvara_breathing_sessions', JSON.stringify(existingSessions));
}

// Get breathing session stats
function getBreathingStats() {
    const sessions = JSON.parse(localStorage.getItem('medisvara_breathing_sessions') || '[]');
    
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => sum + Math.floor(session.duration / 60), 0);
    const averageSession = totalSessions > 0 ? Math.floor(totalMinutes / totalSessions) : 0;
    
    return {
        totalSessions,
        totalMinutes,
        averageSession
    };
}

// Show breathing stats
function showBreathingStats() {
    const stats = getBreathingStats();
    
    if (stats.totalSessions > 0) {
        const message = `You've completed ${stats.totalSessions} breathing sessions for a total of ${stats.totalMinutes} minutes. Keep it up! 🧘‍♀️`;
        showNotification(message, 'info');
    }
}

// Change breathing pattern
function changeBreathingPattern(pattern) {
    if (BREATHING_PATTERNS[pattern]) {
        currentPattern = BREATHING_PATTERNS[pattern];
        showNotification(`Switched to ${pattern} breathing pattern`, 'success');
    }
}

// Initialize breathing timer when the section is shown
document.addEventListener('DOMContentLoaded', function() {
    const breathingSection = document.getElementById('breathing-timer');
    if (breathingSection) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' && 
                    breathingSection.classList.contains('active')) {
                    initializeBreathingTimer();
                    // Show stats after a delay
                    setTimeout(showBreathingStats, 2000);
                }
            });
        });
        
        observer.observe(breathingSection, { attributes: true });
    }
});

// Cleanup when leaving the page
window.addEventListener('beforeunload', function() {
    if (isBreathing) {
        stopBreathing();
    }
});

// Export functions
window.startBreathing = startBreathing;
window.stopBreathing = stopBreathing;
window.changeBreathingPattern = changeBreathingPattern;