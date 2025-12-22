// /ui/leaderboard.js

export function showRoundResult(points, dist, round, maxRounds, onNext, isPerfect = false, currentStreak = 0) {
    const overlay = document.getElementById('nextOverlay');
    overlay.classList.remove('hidden');
    
    document.getElementById('roundScoreVal').innerText = "+" + points;
    
    const feedEl = document.getElementById('roundFeedback');
    if (dist > 900) { 
        feedEl.innerText = "ZEIT ABGELAUFEN"; 
        feedEl.style.color = "#ef4444"; 
    }
    else if (dist < 4) { 
        feedEl.innerText = "PERFEKT! 👑"; 
        feedEl.style.color = "#d946ef"; 
        // Fire is already activated in handleRoundEnd
    }
    else if (dist < 10) { 
        feedEl.innerText = "Fantastisch!"; 
        feedEl.style.color = "#34d399"; 
    }
    else { 
        feedEl.innerText = "Okay"; 
        feedEl.style.color = "#fbbf24"; 
    }

    const btn = document.getElementById('nextBtn');
    btn.innerText = (round === maxRounds) ? "Ergebnis" : "Nächste Runde";
    btn.onclick = onNext;
}

// Update the burning "Perfect" in title based on streak
export function updateBurningTitle(streak) {
    const perfectText = document.getElementById('perfectText');
    if (!perfectText) return;
    
    // Remove existing streak badge
    const existingBadge = perfectText.parentElement.querySelector('.title-streak-badge');
    if (existingBadge) existingBadge.remove();
    
    if (streak > 0) {
        // Activate fire effect
        perfectText.classList.add('on-fire');
        perfectText.setAttribute('data-streak', Math.min(streak, 5));
        
        // Add streak badge
        const badge = document.createElement('span');
        badge.className = 'title-streak-badge';
        badge.setAttribute('data-streak', Math.min(streak, 5));
        badge.innerHTML = `🔥${streak}`;
        perfectText.parentElement.appendChild(badge);
    } else {
        // Remove fire effect
        perfectText.classList.remove('on-fire');
        perfectText.removeAttribute('data-streak');
    }
}

// Reset burning title (call when game ends or streak breaks)
export function resetBurningTitle() {
    const perfectText = document.getElementById('perfectText');
    if (!perfectText) return;
    
    perfectText.classList.remove('on-fire');
    perfectText.removeAttribute('data-streak');
    
    const existingBadge = perfectText.parentElement.querySelector('.title-streak-badge');
    if (existingBadge) existingBadge.remove();
}

export function showEndScreen(score, earnedXp, isTower, towerSuccess, towerFloor, onBack) {
    document.getElementById('nextOverlay').classList.add('hidden');
    const screen = document.getElementById('endScreen');
    screen.classList.remove('hidden');
    
    document.getElementById('finalScore').innerText = score;
    const endTitle = document.getElementById('endTitle');
    const earnEl = document.getElementById('earnedXp');

    if (isTower) {
        if (towerSuccess) {
            endTitle.innerText = "Ebene " + towerFloor + " gemeistert!";
            endTitle.style.color = "#34d399";
        } else {
            endTitle.innerText = "Abgestürzt!";
            endTitle.style.color = "#ef4444";
        }
    } else {
        endTitle.innerText = score > 3500 ? "Hervorragend!" : "Runde Beendet";
        endTitle.style.color = "#fff";
    }

    earnEl.innerText = "+" + earnedXp + " XP";
    
    const backBtn = screen.querySelector('.btn');
    backBtn.onclick = onBack;
}