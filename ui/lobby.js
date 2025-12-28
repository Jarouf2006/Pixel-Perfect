// /ui/lobby.js

/**
 * Aktualisiert das Profil oben rechts (Arc Raiders Style).
 * @param {Object} user - Das User-Objekt.
 * @param {number} xpThreshold - Wieviel XP wird für ein Level benötigt (kommt aus main.js).
 */
export function updateMenuProfile(user, xpThreshold) {
    const nameEl = document.getElementById('arcName');
    const lvlEl = document.getElementById('arcLevel');
    const avatarEl = document.getElementById('avatarInitial');
    
    if (nameEl) nameEl.innerText = user.name;
    // Nur die Zahl (minimalistisch, wie Arc Raiders)
    if (lvlEl) lvlEl.innerText = user.level;
    // Avatar Initial (erster Buchstabe des Namens)
    if (avatarEl) avatarEl.innerText = user.name.charAt(0).toUpperCase();
    
    // Perfect Coins anzeigen
    const coinsEl = document.getElementById('perfectCoinsCount');
    if (coinsEl) coinsEl.innerText = user.perfectCoins || 0;
    
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

// Update coin display and avatar color based on mode
export function updateCoinDisplayColor(mode, towerColor = null) {
    const coinDisplay = document.getElementById('perfectCoinsDisplay');
    const avatarCircle = document.getElementById('avatarCircle');
    if (!coinDisplay) return;
    
    // Mode-specific colors
    const modeColors = {
        'normal': { border: 'rgba(52, 211, 153, 0.4)', glow: 'rgba(52, 211, 153, 0.2)', text: '#6ee7b7', solid: '#34d399' },
        'turnier': { border: 'rgba(245, 158, 11, 0.4)', glow: 'rgba(245, 158, 11, 0.2)', text: '#fcd34d', solid: '#f59e0b' },
        'blitz': { border: 'rgba(251, 191, 36, 0.4)', glow: 'rgba(251, 191, 36, 0.2)', text: '#fde68a', solid: '#fbbf24' },
        'hunter': { border: 'rgba(34, 211, 238, 0.4)', glow: 'rgba(34, 211, 238, 0.2)', text: '#67e8f9', solid: '#22d3ee' },
        'pulsar': { border: 'rgba(232, 121, 249, 0.4)', glow: 'rgba(232, 121, 249, 0.2)', text: '#f0abfc', solid: '#e879f9' },
        'blueprint': { border: 'rgba(96, 165, 250, 0.4)', glow: 'rgba(96, 165, 250, 0.2)', text: '#93c5fd', solid: '#60a5fa' },
        'spotlight': { border: 'rgba(148, 163, 184, 0.4)', glow: 'rgba(148, 163, 184, 0.2)', text: '#cbd5e1', solid: '#94a3b8' },
        'magnet': { border: 'rgba(251, 146, 60, 0.4)', glow: 'rgba(251, 146, 60, 0.2)', text: '#fdba74', solid: '#fb923c' },
        'glitch': { border: 'rgba(192, 132, 252, 0.4)', glow: 'rgba(192, 132, 252, 0.2)', text: '#d8b4fe', solid: '#c084fc' },
        'mirage': { border: 'rgba(45, 212, 191, 0.4)', glow: 'rgba(45, 212, 191, 0.2)', text: '#5eead4', solid: '#2dd4bf' },
        'mirror': { border: 'rgba(203, 213, 225, 0.4)', glow: 'rgba(203, 213, 225, 0.2)', text: '#e2e8f0', solid: '#cbd5e1' },
        'custom': { border: 'rgba(167, 139, 250, 0.4)', glow: 'rgba(167, 139, 250, 0.2)', text: '#c4b5fd', solid: '#a78bfa' }
    };
    
    let colors;
    if (mode === 'tower' && towerColor) {
        // Use tower color
        colors = { 
            border: towerColor + '66', 
            glow: towerColor + '33', 
            text: towerColor,
            solid: towerColor
        };
    } else {
        colors = modeColors[mode] || modeColors['normal'];
    }
    
    coinDisplay.style.setProperty('--coin-color', colors.border);
    coinDisplay.style.setProperty('--coin-glow', colors.glow);
    coinDisplay.style.setProperty('--coin-text', colors.text);
    
    // Update avatar circle colors too
    if (avatarCircle) {
        avatarCircle.style.setProperty('--coin-color', colors.border);
        avatarCircle.style.setProperty('--coin-text', colors.text);
    }
    
    // Update level circle colors via CSS variable on wrapper
    const levelWrapper = document.querySelector('.arc-circle-wrapper');
    if (levelWrapper) {
        levelWrapper.style.setProperty('--level-color', colors.solid);
    }
}

export function showAuth() {
    const start = document.getElementById('startScreen');
    const auth = document.getElementById('authOverlay');
    const intro = document.getElementById('introOverlay');

    if (start) start.classList.add('hidden');
    if (intro) intro.classList.add('hidden');
    if (auth) auth.classList.remove('hidden');
}

export function hideAuth() {
    const auth = document.getElementById('authOverlay');
    const start = document.getElementById('startScreen');
    const intro = document.getElementById('introOverlay');

    if (auth) auth.classList.add('hidden');
    if (intro) intro.classList.add('hidden');
    if (start) start.classList.remove('hidden');
}

export function checkEasterEggs(name) {
    document.body.className = '';
    if (!name) return;
    
    const n = name.toLowerCase();
    if (n === 'glitch') document.body.classList.add('theme-glitch');
    else if (n === 'matrix') document.body.classList.add('theme-matrix');
    else if (n === 'disco') document.body.classList.add('theme-disco');
}

export function triggerXPAnim() {
    const el = document.getElementById('arcLevel');
    const wrapper = document.querySelector('.arc-circle-wrapper');
    if (!el || !wrapper) return;

    el.classList.remove('level-anim');
    void el.offsetWidth; // Trigger Reflow
    el.classList.add('level-anim');
    
    // Get current color from level text
    const currentColor = getComputedStyle(el).color || '#34d399';

    for (let i = 0; i < 15; i++) {
        const d = document.createElement('div');
        d.className = 'xp-particle';
        d.style.left = '26px';
        d.style.top = '26px';
        d.style.background = currentColor;
        d.style.boxShadow = `0 0 4px ${currentColor}`;
        wrapper.appendChild(d);
        
        const angle = Math.random() * 6.28;
        const speed = 2 + Math.random() * 4;
        let vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed;
        let life = 1;
        
        function animate() {
            if (life <= 0) {
                d.remove();
            } else {
                life -= 0.02;
                d.style.left = (parseFloat(d.style.left) + vx) + 'px';
                d.style.top = (parseFloat(d.style.top) + vy) + 'px';
                d.style.opacity = life;
                vx *= 0.95;
                vy *= 0.95;
                requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
    }
}