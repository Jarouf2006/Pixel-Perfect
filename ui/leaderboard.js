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

// Update the burning title effect based on streak
export function updateBurningTitle(streak) {
    console.log('updateBurningTitle called with streak:', streak);
    
    const title = document.getElementById('mainTitle');
    const fireEffect = document.getElementById('fireEffect');
    
    if (!title) {
        console.log('No title element found!');
        return;
    }
    
    if (streak > 0) {
        const level = Math.min(streak, 5);
        
        // Remove any existing inline background styles that might conflict
        title.style.background = '';
        title.style.backgroundClip = '';
        title.style.webkitBackgroundClip = '';
        title.style.webkitTextFillColor = '';
        title.style.color = '';
        title.style.filter = '';
        
        // Use CSS classes for styling
        title.classList.add('on-fire');
        
        // Remove all streak level classes first
        title.classList.remove('fire-level-1', 'fire-level-2', 'fire-level-3', 'fire-level-4', 'fire-level-5');
        
        // Add the correct level class
        title.classList.add('fire-level-' + level);
        title.setAttribute('data-streak', level);
        
        console.log('Set fire level class:', level);
        
        // Show and create fire particles
        if (fireEffect) {
            fireEffect.classList.remove('hidden');
            createFireParticles(fireEffect, level);
        }
    } else {
        // Remove fire effect
        title.classList.remove('on-fire', 'fire-level-1', 'fire-level-2', 'fire-level-3', 'fire-level-4', 'fire-level-5');
        title.removeAttribute('data-streak');
        title.style.filter = '';
        
        if (fireEffect) {
            fireEffect.classList.add('hidden');
            fireEffect.innerHTML = '';
        }
    }
}

// Create animated fire particles
function createFireParticles(container, level) {
    // Clear existing particles
    container.innerHTML = '';
    
    // More particles and faster at higher levels
    const particleCount = 10 + (level * 8); // 18, 26, 34, 42, 50 particles
    const baseSpeed = 1.2 - (level * 0.15); // Faster animation: 1.05, 0.9, 0.75, 0.6, 0.45
    
    // Metal flame color palettes (brighter versions)
    const colorPalettes = {
        1: ['#ffcdd2', '#ef5350', '#e53935', '#f44336', '#ff5252'],           // Red (Lithium)
        2: ['#ffe0b2', '#ffb74d', '#ff9800', '#ffa726', '#ffcc80'],           // Orange (Calcium)
        3: ['#e8f5e9', '#a5d6a7', '#66bb6a', '#81c784', '#4caf50'],           // Bright Green (Copper)
        4: ['#f3e5f5', '#ce93d8', '#ab47bc', '#ba68c8', '#9c27b0'],           // Bright Violet (Potassium)
        5: ['#e3f2fd', '#90caf9', '#42a5f5', '#64b5f6', '#2196f3']            // Bright Blue (Copper Chloride)
    };
    
    const colors = colorPalettes[level] || colorPalettes[1];
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'fire-particle';
        
        const size = 3 + Math.random() * (8 + level * 2); // Bigger particles at higher levels
        const left = 5 + Math.random() * 90;
        const duration = baseSpeed + Math.random() * 0.8;
        const delay = Math.random() * 1.5;
        const drift = (Math.random() - 0.5) * (20 + level * 5); // More drift at higher levels
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.cssText = `
            left: ${left}%;
            width: ${size}px;
            height: ${size}px;
            background: radial-gradient(circle, ${color} 0%, transparent 70%);
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            --drift: ${drift}px;
            box-shadow: 0 0 ${size + level * 2}px ${color};
        `;
        
        container.appendChild(particle);
    }
}

// Reset burning title (call when game starts)
export function resetBurningTitle() {
    const title = document.getElementById('mainTitle');
    const badge = document.getElementById('streakBadge');
    const fireEffect = document.getElementById('fireEffect');
    
    if (title) {
        title.classList.remove('on-fire');
        title.removeAttribute('data-streak');
    }
    
    if (fireEffect) {
        fireEffect.classList.add('hidden');
        fireEffect.innerHTML = '';
    }
    
    if (badge) {
        badge.classList.add('hidden');
        badge.removeAttribute('data-streak');
    }
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