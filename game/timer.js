// /game/timer.js

export function updateTimerUI(settings, startTime, blitzEndTime, phase) {
    const timerBar = document.getElementById('timerBar');
    const timerContainer = document.getElementById('timerContainer');
    if (!timerBar) return false;
    
    const now = Date.now();
    let remaining = 0;
    let total = 0;

    // Blitz mode: Timer only starts after countdown + flash phase
    if (settings.visibility === 'blitz') {
        if (phase === 'input' && settings.timer !== 'off') {
            // Show timer container once input phase starts
            if (timerContainer) timerContainer.classList.add('active');
            
            const inputStart = blitzEndTime + 250;
            total = parseInt(settings.timer);
            remaining = Math.max(0, total - (now - inputStart));
        } else {
            // Hide timer during countdown/flash phase
            if (timerContainer && settings.timer !== 'off') timerContainer.classList.remove('active');
            return false;
        }
    } else if (settings.timer !== 'off') {
        total = parseInt(settings.timer);
        remaining = Math.max(0, total - (now - startTime));
    }

    if (total > 0) {
        timerBar.style.transform = `scaleX(${remaining / total})`;
    }
    
    return remaining <= 0 && total > 0; 
}

export function resetTimerUI() {
    const timerBar = document.getElementById('timerBar');
    if(timerBar) {
        timerBar.style.transition = 'none'; 
        timerBar.style.transform = 'scaleX(1)'; 
        void timerBar.offsetWidth; 
        timerBar.style.transition = 'transform 0.1s linear';
    }
}