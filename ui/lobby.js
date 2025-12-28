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
    // solid = first gradient color (for buttons, grid)
    // secondary = second gradient color (for level, coins)
    const modeColors = {
        'normal': { solid: '#60a5fa', dark: '#3b82f6', secondary: '#34d399' },
        'turnier': { solid: '#ef4444', dark: '#dc2626', secondary: '#f59e0b' },
        'blitz': { solid: '#f59e0b', dark: '#d97706', secondary: '#fbbf24' },
        'hunter': { solid: '#06b6d4', dark: '#0891b2', secondary: '#22d3ee' },
        'pulsar': { solid: '#d946ef', dark: '#c026d3', secondary: '#e879f9' },
        'blueprint': { solid: '#3b82f6', dark: '#2563eb', secondary: '#60a5fa' },
        'spotlight': { solid: '#64748b', dark: '#475569', secondary: '#94a3b8' },
        'shrink': { solid: '#ec4899', dark: '#db2777', secondary: '#f472b6' },
        'glitch': { solid: '#a855f7', dark: '#9333ea', secondary: '#c084fc' },
        'mirage': { solid: '#14b8a6', dark: '#0d9488', secondary: '#2dd4bf' },
        'decay': { solid: '#84cc16', dark: '#65a30d', secondary: '#a3e635' },
        'custom': { solid: '#8b5cf6', dark: '#7c3aed', secondary: '#a78bfa' }
    };
    
    let colors;
    if (mode === 'tower' && towerColor) {
        // Use tower color (lighten for secondary)
        colors = { 
            solid: towerColor,
            dark: darkenColor(towerColor, 20),
            secondary: lightenColor(towerColor, 20)
        };
    } else {
        colors = modeColors[mode] || modeColors['normal'];
    }
    
    // Secondary color for coins and level (second gradient color)
    const secondaryRgba = hexToRgba(colors.secondary, 0.4);
    const secondaryGlow = hexToRgba(colors.secondary, 0.2);
    
    coinDisplay.style.setProperty('--coin-color', secondaryRgba);
    coinDisplay.style.setProperty('--coin-glow', secondaryGlow);
    coinDisplay.style.setProperty('--coin-text', colors.secondary);
    
    // Update avatar circle colors (also secondary)
    if (avatarCircle) {
        avatarCircle.style.setProperty('--coin-color', secondaryRgba);
        avatarCircle.style.setProperty('--coin-text', colors.secondary);
    }
    
    // Update level circle colors (secondary)
    const levelWrapper = document.querySelector('.arc-circle-wrapper');
    if (levelWrapper) {
        levelWrapper.style.setProperty('--level-color', colors.secondary);
    }
    
    // Set global mode color CSS variables on body for buttons, cards, etc. (primary/solid)
    const primaryRgba = hexToRgba(colors.solid, 0.4);
    const primaryGlow = hexToRgba(colors.solid, 0.2);
    
    document.body.style.setProperty('--mode-color', colors.solid);
    document.body.style.setProperty('--mode-color-dark', colors.dark);
    document.body.style.setProperty('--mode-glow', primaryGlow);
    document.body.style.setProperty('--mode-glow-strong', primaryRgba);
    document.body.style.setProperty('--mode-bg', primaryGlow);
}

// Helper: Hex to RGBA
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

// Helper: Lighten a hex color
function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
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