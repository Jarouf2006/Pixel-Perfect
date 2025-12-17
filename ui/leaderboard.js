// /ui/leaderboard.js

export function showRoundResult(points, dist, round, maxRounds, onNext) {
    const overlay = document.getElementById('nextOverlay');
    overlay.classList.remove('hidden');
    
    document.getElementById('roundScoreVal').innerText = "+" + points;
    
    const feedEl = document.getElementById('roundFeedback');
    if (dist > 900) { feedEl.innerText = "ZEIT ABGELAUFEN"; feedEl.style.color = "#ef4444"; }
    else if (dist < 4) { feedEl.innerText = "PERFEKT! 👑"; feedEl.style.color = "#d946ef"; }
    else if (dist < 10) { feedEl.innerText = "Fantastisch!"; feedEl.style.color = "#34d399"; }
    else { feedEl.innerText = "Okay"; feedEl.style.color = "#fbbf24"; }

    const btn = document.getElementById('nextBtn');
    btn.innerText = (round === maxRounds) ? "Ergebnis" : "Nächste Runde";
    btn.onclick = onNext;
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