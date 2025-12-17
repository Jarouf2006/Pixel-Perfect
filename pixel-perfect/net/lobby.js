// /ui/lobby.js

/**
 * Aktualisiert das Profil oben rechts.
 * @param {Object} user - Das User-Objekt.
 * @param {number} xpThreshold - Wieviel XP wird für ein Level benötigt (kommt aus main.js).
 */
export function updateMenuProfile(user, xpThreshold) {
    document.getElementById('arcName').innerText = user.name;
    document.getElementById('arcLevel').innerText = user.level;
    
    const c = document.getElementById('arcProgress');
    if (c) {
        const r = c.r.baseVal.value;
        const cf = r * 2 * Math.PI;
        c.style.strokeDasharray = `${cf} ${cf}`;
        
        // Berechnung basierend auf dem übergebenen Threshold
        const curLvlXp = (user.level - 1) * xpThreshold;
        const xpIn = user.xp - curLvlXp;
        
        // Prozentberechnung (0 bis 100)
        const p = Math.min(100, Math.max(0, (xpIn / xpThreshold) * 100));
        
        c.style.strokeDashoffset = cf - (p / 100) * cf;
    }
    
    // Tooltip aktualisieren
    const xpMissing = xpThreshold - (user.xp - ((user.level - 1) * xpThreshold));
    const tooltip = document.getElementById('xpTooltip');
    if (tooltip) tooltip.innerText = `Noch ${xpMissing} XP bis Level ${user.level + 1}`;
}

export function showAuth() {
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('authOverlay').classList.remove('hidden');
}

export function hideAuth() {
    document.getElementById('authOverlay').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
}

export function checkEasterEggs(name) {
    document.body.className = '';
    const n = name.toLowerCase();
    if (n === 'glitch') document.body.classList.add('theme-glitch');
    else if (n === 'matrix') document.body.classList.add('theme-matrix');
    else if (n === 'disco') document.body.classList.add('theme-disco');
}

export function triggerXPAnim() {
    const el = document.getElementById('arcLevel');
    el.classList.remove('level-anim');
    void el.offsetWidth; // Trigger Reflow
    el.classList.add('level-anim');
    
    const container = document.querySelector('.arc-profile-container');
    for(let i=0; i<15; i++) {
        const d = document.createElement('div');
        d.className='xp-particle';
        d.style.left='30px'; d.style.top='30px';
        container.appendChild(d);
        
        const angle = Math.random()*6.28;
        const speed = 2+Math.random()*4;
        let vx=Math.cos(angle)*speed, vy=Math.sin(angle)*speed;
        let life=1;
        
        function f(){
            if(life<=0) d.remove();
            else {
                life-=0.02;
                d.style.left=(parseFloat(d.style.left)+vx)+'px';
                d.style.top=(parseFloat(d.style.top)+vy)+'px';
                d.style.opacity=life;
                vx*=0.95; vy*=0.95;
                requestAnimationFrame(f);
            }
        }
        requestAnimationFrame(f);
    }
}