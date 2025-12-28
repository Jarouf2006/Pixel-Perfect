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
    
    // Mode-specific colors - using FIRST gradient color as primary (matches h1)
    const modeColors = {
        'normal': { border: 'rgba(96, 165, 250, 0.4)', glow: 'rgba(96, 165, 250, 0.2)', text: '#93c5fd', solid: '#60a5fa', dark: '#3b82f6' },
        'turnier': { border: 'rgba(239, 68, 68, 0.4)', glow: 'rgba(239, 68, 68, 0.2)', text: '#fca5a5', solid: '#ef4444', dark: '#dc2626' },
        'blitz': { border: 'rgba(245, 158, 11, 0.4)', glow: 'rgba(245, 158, 11, 0.2)', text: '#fcd34d', solid: '#f59e0b', dark: '#d97706' },
        'hunter': { border: 'rgba(6, 182, 212, 0.4)', glow: 'rgba(6, 182, 212, 0.2)', text: '#67e8f9', solid: '#06b6d4', dark: '#0891b2' },
        'pulsar': { border: 'rgba(217, 70, 239, 0.4)', glow: 'rgba(217, 70, 239, 0.2)', text: '#f0abfc', solid: '#d946ef', dark: '#c026d3' },
        'blueprint': { border: 'rgba(59, 130, 246, 0.4)', glow: 'rgba(59, 130, 246, 0.2)', text: '#93c5fd', solid: '#3b82f6', dark: '#2563eb' },
        'spotlight': { border: 'rgba(100, 116, 139, 0.4)', glow: 'rgba(100, 116, 139, 0.2)', text: '#cbd5e1', solid: '#64748b', dark: '#475569' },
        'shrink': { border: 'rgba(236, 72, 153, 0.4)', glow: 'rgba(236, 72, 153, 0.2)', text: '#f9a8d4', solid: '#ec4899', dark: '#db2777' },
        'glitch': { border: 'rgba(168, 85, 247, 0.4)', glow: 'rgba(168, 85, 247, 0.2)', text: '#d8b4fe', solid: '#a855f7', dark: '#9333ea' },
        'mirage': { border: 'rgba(20, 184, 166, 0.4)', glow: 'rgba(20, 184, 166, 0.2)', text: '#5eead4', solid: '#14b8a6', dark: '#0d9488' },
        'decay': { border: 'rgba(132, 204, 22, 0.4)', glow: 'rgba(132, 204, 22, 0.2)', text: '#bef264', solid: '#84cc16', dark: '#65a30d' },
        'custom': { border: 'rgba(139, 92, 246, 0.4)', glow: 'rgba(139, 92, 246, 0.2)', text: '#c4b5fd', solid: '#8b5cf6', dark: '#7c3aed' }
    };
    
    let colors;
    if (mode === 'tower' && towerColor) {
        // Use tower color
        colors = { 
            border: towerColor + '66', 
            glow: towerColor + '33', 
            text: towerColor,
            solid: towerColor,
            dark: darkenColor(towerColor, 20)
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
    
    // Set global mode color CSS variables on body for buttons, cards, etc.
    document.body.style.setProperty('--mode-color', colors.solid);
    document.body.style.setProperty('--mode-color-dark', colors.dark);
    document.body.style.setProperty('--mode-glow', colors.glow);
    document.body.style.setProperty('--mode-glow-strong', colors.border);
    document.body.style.setProperty('--mode-bg', colors.glow);
}

// Helper: Darken a hex color
function darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
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