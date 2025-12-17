// /game/timer.js

export function updateTimerUI(settings, startTime, blitzEndTime, phase) {
    const timerBar = document.getElementById('timerBar');
    if (!timerBar) return false;
    
    const now = Date.now();
    let remaining = 0;
    let total = 0;

    if (settings.visibility === 'blitz' && phase === 'input') {
        const inputStart = blitzEndTime + 250;
        if (settings.timer !== 'off') {
            total = parseInt(settings.timer);
            remaining = Math.max(0, total - (now - inputStart));
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