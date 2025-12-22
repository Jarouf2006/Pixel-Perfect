// ui/menu.js

const MODES = [
    { id: 'normal', name: 'Normal', icon: '🎯', desc: '<ul><li>🎯 Sammle XP für Level-Ups.</li><li>🧘 Kein Zeitdruck.</li></ul>' },
    { id: 'turnier', name: 'Turnier', icon: '🏆', desc: '<ul><li>🏆 <strong>Ab Level 3</strong></li><li>🔥 Zeitdruck & Rotation.</li></ul>' },
    { id: 'blitz', name: 'Blitz', icon: '⚡', desc: '<ul><li>⚡ <strong>Doppelte XP (x2)</strong></li><li>👁️ Form ist unsichtbar.</li></ul>' },
    { id: 'hunter', name: 'Hunter', icon: '🏹', desc: '<ul><li>🏹 <strong>Ab Level 7</strong></li><li>🏃 Die Form bewegt sich.</li></ul>' },
    { id: 'pulsar', name: 'Pulsar', icon: '💓', desc: '<ul><li>💓 <strong>Ab Level 10</strong></li><li>🫀 Die Form atmet.</li></ul>' },
    { id: 'blueprint', name: 'Points', icon: '∴', desc: '<ul><li>∴ <strong>Ab Level 12</strong></li><li>🚫 Nur Eckpunkte sichtbar.</li></ul>' },
    { id: 'spotlight', name: 'Spotlight', icon: '🔦', desc: '<ul><li>🔦 <strong>Ab Level 15</strong></li><li>🌑 Alles ist dunkel.</li></ul>' },
    { id: 'magnet', name: 'Magnet', icon: '🧲', desc: '<ul><li>🧲 <strong>Ab Level 18</strong></li><li>🌪️ Ein Kraftfeld stößt die Maus weg.</li></ul>' },
    { id: 'glitch', name: 'Glitch', icon: '👾', desc: '<ul><li>👾 <strong>Ab Level 20</strong></li><li>📺 Die Simulation ist kaputt.</li></ul>' },
    { id: 'mirage', name: 'Mirage', icon: '🧞', desc: '<ul><li>🧞 <strong>Ab Level 22</strong></li><li>😵 Geisterbilder verwirren dich.</li></ul>' },
    { id: 'mirror', name: 'Mirror', icon: '🪞', desc: '<ul><li>🪞 <strong>Ab Level 25</strong></li><li>🔄 Steuerung ist invertiert.</li></ul>' },
    { id: 'custom', name: 'Custom', icon: '🛠️', desc: '<ul><li>🛠️ Sandbox Modus.</li><li>🧪 Keine XP.</li></ul>' }
];

export function buildModeGrid(userLevel, requirements, currentMode, onSelect) {
    const grid = document.getElementById('modesGrid');
    if(!grid) return;
    grid.innerHTML = '';
    
    MODES.forEach(m => {
        const locked = m.id !== 'normal' && m.id !== 'custom' && userLevel < requirements[m.id];
        const div = document.createElement('div');
        div.className = `mode-card ${locked ? 'locked' : ''} ${currentMode === m.id ? 'active' : ''}`;
        div.id = `card_${m.id}`;
        div.onclick = () => { if (!locked) onSelect(m.id); };
        div.innerHTML = `<div class="mode-icon">${m.icon}</div><div class="mode-name">${m.name}</div>${locked ? `<div style="font-size:10px; margin-top:5px;">🔒 Lv ${requirements[m.id]}</div>` : ''}`;
        grid.appendChild(div);
    });
}

export function updateSettingsUI(mode, blitzExtreme) {
    const settingsArea = document.getElementById('settingsArea');
    const descArea = document.getElementById('descArea');
    const title = document.getElementById('mainTitle');

    if (settingsArea) settingsArea.classList.remove('hidden');
    
    const modeData = MODES.find(m => m.id === mode);
    if (descArea && modeData) {
        descArea.innerHTML = `<strong>${modeData.name.toUpperCase()}</strong>${modeData.desc}`;
    }

    if (settingsArea) {
        // FIX: Entferne distribute-Klasse erstmal
        settingsArea.classList.remove('distribute');
        
        if (mode === 'blitz') {
            settingsArea.innerHTML = `
                <div class="switch-container">
                    <span class="switch-label">🔥 BLITZ EXTREME</span>
                    <input type="checkbox" id="extremeToggle" ${blitzExtreme ? 'checked' : ''}>
                </div>`;
            // FIX: Nur eine Setting -> verteilen (zentriert)
            settingsArea.classList.add('distribute');
            
        } else if (mode === 'custom') {
            // FIX: Viele Settings -> NICHT verteilen, scrollbar aktiv
            settingsArea.innerHTML = `
                <div class="setting-group">
                    <select id="c_size" class="edgeless-select" data-label="Größe">
                        <option value="medium" selected>Mittel</option>
                        <option value="small">Klein</option>
                        <option value="large">Groß</option>
                    </select>
                </div>
                <div class="setting-group">
                    <select id="c_comp" class="edgeless-select" data-label="Komplexität">
                        <option value="medium" selected>Normal</option>
                        <option value="simple">Simpel</option>
                        <option value="chaos">Chaos</option>
                    </select>
                </div>
                <div class="setting-group">
                    <select id="c_rot" class="edgeless-select" data-label="Rotation">
                        <option value="off" selected>Aus</option>
                        <option value="slow">Langsam</option>
                        <option value="fast">Schnell</option>
                    </select>
                </div>
                <div class="setting-group">
                    <select id="c_time" class="edgeless-select" data-label="Zeitlimit">
                        <option value="off" selected>Keins</option>
                        <option value="3000">3 Sek</option>
                    </select>
                </div>
                <div class="setting-group">
                    <select id="c_vis" class="edgeless-select" data-label="Sichtbarkeit">
                        <option value="normal" selected>Normal</option>
                        <option value="blitz">Blitz</option>
                    </select>
                </div>
                <div class="setting-group">
                    <select id="c_move" class="edgeless-select" data-label="Bewegung">
                        <option value="off" selected>Aus</option>
                        <option value="hunter">Hunter</option>
                    </select>
                </div>
                <div class="setting-group">
                    <select id="c_spec" class="edgeless-select" data-label="Special">
                        <option value="off" selected>Aus</option>
                        <option value="pulsar">Pulsar</option>
                        <option value="glitch">Glitch</option>
                        <option value="mirage">Mirage</option>
                    </select>
                </div>
                <div class="setting-group">
                    <select id="c_style" class="edgeless-select" data-label="Style">
                        <option value="normal" selected>Normal</option>
                        <option value="blueprint">Blueprint</option>
                        <option value="spotlight">Spotlight</option>
                    </select>
                </div>
                <div class="setting-group">
                    <select id="c_cursor" class="edgeless-select" data-label="Cursor">
                        <option value="normal" selected>Normal</option>
                        <option value="magnet">Magnet</option>
                        <option value="mirror">Mirror</option>
                    </select>
                </div>`;
            // Keine distribute-Klasse für Custom -> scrollt stattdessen
            initSelectLabels(settingsArea);
            
        } else {
            // Alle anderen Modi: Größe und Abstraktion einstellbar
            settingsArea.innerHTML = `
                <div class="setting-group">
                    <select id="sizeSelect" class="edgeless-select" data-label="Größe">
                        <option value="large">Groß</option>
                        <option value="medium" selected>Mittel</option>
                        <option value="small">Klein</option>
                    </select>
                </div>
                <div class="setting-group">
                    <select id="compSelect" class="edgeless-select" data-label="Abstraktion">
                        <option value="simple">Simpel</option>
                        <option value="medium" selected>Normal</option>
                        <option value="chaos">Chaos</option>
                    </select>
                </div>`;
            settingsArea.classList.add('distribute');
            initSelectLabels(settingsArea);
        }
    }
    
    if (title) {
        // Get the title-text span (contains the gradient)
        const titleText = title.querySelector('.title-text');
        
        let grad = "";
        let glowColor = "rgba(52, 211, 153, 0.6)"; // Default grün
        
        // Statische Gradients - weißer Shimmer kommt vom CSS ::after
        if (mode === 'normal') {
            grad = "linear-gradient(to right, #60a5fa, #34d399)";
            glowColor = "rgba(52, 211, 153, 0.6)";
        }
        else if (mode === 'turnier') {
            grad = "linear-gradient(to right, #ef4444, #f59e0b)";
            glowColor = "rgba(239, 68, 68, 0.6)";
        }
        else if (mode === 'blitz') {
            grad = "linear-gradient(to right, #f59e0b, #fbbf24)";
            glowColor = "rgba(245, 158, 11, 0.6)";
        }
        else if (mode === 'hunter') {
            grad = "linear-gradient(to right, #06b6d4, #22d3ee)";
            glowColor = "rgba(6, 182, 212, 0.6)";
        }
        else if (mode === 'pulsar') {
            grad = "linear-gradient(to right, #d946ef, #e879f9)";
            glowColor = "rgba(217, 70, 239, 0.6)";
        }
        else if (mode === 'blueprint') {
            grad = "linear-gradient(to right, #3b82f6, #60a5fa)";
            glowColor = "rgba(59, 130, 246, 0.6)";
        }
        else if (mode === 'spotlight') {
            grad = "linear-gradient(to right, #64748b, #94a3b8)";
            glowColor = "rgba(100, 116, 139, 0.6)";
        }
        else if (mode === 'magnet') {
            grad = "linear-gradient(to right, #f97316, #fb923c)";
            glowColor = "rgba(249, 115, 22, 0.6)";
        }
        else if (mode === 'glitch') {
            grad = "linear-gradient(to right, #a855f7, #c084fc)";
            glowColor = "rgba(168, 85, 247, 0.6)";
        }
        else if (mode === 'mirage') {
            grad = "linear-gradient(to right, #14b8a6, #2dd4bf)";
            glowColor = "rgba(20, 184, 166, 0.6)";
        }
        else if (mode === 'mirror') {
            grad = "linear-gradient(to right, #94a3b8, #cbd5e1)";
            glowColor = "rgba(148, 163, 184, 0.6)";
        }
        else if (mode === 'custom') {
            grad = "linear-gradient(to right, #8b5cf6, #a78bfa)";
            glowColor = "rgba(139, 92, 246, 0.6)";
        }
        
        if (grad) {
            // Apply to title-text span if it exists
            if (titleText) {
                titleText.style.background = grad;
                titleText.style.webkitBackgroundClip = "text";
                titleText.style.webkitTextFillColor = "transparent";
            } else {
                // Fallback for auth screens without spans
                title.style.background = grad;
                title.style.webkitBackgroundClip = "text"; 
                title.style.webkitTextFillColor = "transparent";
            }
            title.style.setProperty('--glow-color', glowColor);
        }
    }
}

// Update Title für Tower Mode - passt Farbe an aktuelle Ebene an
export function updateTitleForTower(themeColor) {
    const title = document.getElementById('mainTitle');
    if (!title) return;
    
    const titleText = title.querySelector('.title-text');
    
    // Hellere Version der Farbe für Gradient
    const lighterColor = themeColor + 'cc'; // etwas transparenter
    const grad = `linear-gradient(to right, ${themeColor}, ${lighterColor})`;
    
    if (titleText) {
        titleText.style.background = grad;
        titleText.style.webkitBackgroundClip = "text";
        titleText.style.webkitTextFillColor = "transparent";
    } else {
        title.style.background = grad;
        title.style.webkitBackgroundClip = "text"; 
        title.style.webkitTextFillColor = "transparent";
    }
    
    title.style.setProperty('--glow-color', hexToRgba(themeColor, 0.6));
}

// Helper: Hex zu RGBA
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function updateTowerUI(floor, maxFloor, config, themeColor, onStart, userName, towerAscended) {
    const view = document.getElementById('viewTower');
    if(!view) return;

    // Dev Button nur für Liam
    let devBtn = '';
    if (userName && userName.toLowerCase() === 'liam') {
        devBtn = `<button class="btn tower-dev-btn" id="devSkipBtn">🚧 DEV: SKIP 10</button>`;
    }

    // Rekord Anzeige mit Pokal wenn Level 30 erreicht
    let recordDisplay = `Rekord: Ebene ${maxFloor || 1}`;
    if (maxFloor >= 30) recordDisplay += " 🏆";

    // Animationsklassen
    const contentClass = towerAscended ? "tower-content-fade" : "";
    const cardAnimClass = towerAscended ? "tower-card-anim" : "";

    view.innerHTML = `
        <!-- LINKE SEITE: Tower Info (wie modesGrid) -->
        <div class="tower-main">
            <div class="tower-header ${cardAnimClass}">
                <div class="tower-icon" style="filter: drop-shadow(0 0 15px ${themeColor});">🗼</div>
                <div class="tower-info">
                    <h2 class="tower-floor ${contentClass}" style="color: ${themeColor};" id="towerLevelText">Ebene ${floor}</h2>
                    <div class="tower-record">${recordDisplay}</div>
                </div>
            </div>
            
            <div class="tower-stats-grid ${cardAnimClass}">
                <div class="tower-stat-card">
                    <div class="tower-stat-icon">🎯</div>
                    <div class="tower-stat-label">Ziel-Punkte</div>
                    <div class="tower-stat-value">${config.target}</div>
                </div>
                <div class="tower-stat-card">
                    <div class="tower-stat-icon">${config.size === 'small' ? '🔬' : config.size === 'large' ? '🔭' : '📐'}</div>
                    <div class="tower-stat-label">Größe</div>
                    <div class="tower-stat-value">${config.size.toUpperCase()}</div>
                </div>
                <div class="tower-stat-card">
                    <div class="tower-stat-icon">${config.rotation !== 'off' ? '🔄' : '⏸️'}</div>
                    <div class="tower-stat-label">Rotation</div>
                    <div class="tower-stat-value">${config.rotation.toUpperCase()}</div>
                </div>
            </div>
        </div>
        
        <!-- RECHTE SEITE: Gefahren & Info (wie right-panel) -->
        <div class="tower-sidebar">
            <div class="tower-dangers ${cardAnimClass}">
                <div class="tower-dangers-title">⚠️ Gefahren</div>
                <ul class="tower-dangers-list">
                    ${config.movement !== 'off' ? `<li style="color:${themeColor}">🏃 Hunter aktiv</li>` : '<li class="inactive">🏃 Hunter inaktiv</li>'}
                    ${config.style === 'spotlight' ? `<li style="color:#94a3b8">🔦 Dunkelheit</li>` : ''}
                    ${config.cursor === 'magnet' ? `<li style="color:#f97316">🧲 Magnet-Feld</li>` : ''}
                    ${config.cursor === 'mirror' ? `<li style="color:#e2e8f0">🪞 Spiegelung</li>` : ''}
                    ${config.timer !== 'off' ? `<li style="color:#ef4444">⏱️ Zeitlimit</li>` : ''}
                    ${config.special === 'glitch' ? `<li style="color:#a855f7">👾 Glitch</li>` : ''}
                    ${config.special === 'mirage' ? `<li style="color:#14b8a6">🧞 Mirage</li>` : ''}
                </ul>
            </div>
            
            <div class="tower-reward ${cardAnimClass}">
                <div class="tower-reward-text">✨ XP Belohnung: <strong style="color: ${themeColor};">${config.target}</strong></div>
                ${floor > 1 ? '<div class="tower-warning">⚠ Bei Niederlage zurück auf Ebene 1</div>' : '<div class="tower-hint">💡 Erste Ebene - kein Risiko!</div>'}
            </div>
        </div>
        
        <!-- BUTTON BEREICH (wie buttons-panel) -->
        <div class="tower-buttons">
            <button class="btn ${cardAnimClass}" id="startTowerBtn" style="background: linear-gradient(135deg, ${themeColor}, ${themeColor}dd); border-color: ${themeColor}; box-shadow: 0 4px 20px ${themeColor}40;">
                Ebene ${floor} Betreten
            </button>
            ${devBtn}
        </div>
    `;
    
    // Event Listeners
    setTimeout(() => {
        const btn = document.getElementById('startTowerBtn');
        if(btn) btn.onclick = onStart;
    }, 0);
    
    // Partikel Animation wenn aufgestiegen
    if (towerAscended) {
        triggerEpicAscendAnimation(floor, themeColor);
    }
    
    view.classList.remove('hidden');
}

// Helper: Tower Color based on floor
function getTowerColor(floor) {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'];
    return colors[(floor - 1) % colors.length];
}

// ==========================================
// EPIC FULLSCREEN ASCEND ANIMATION
// ==========================================
function triggerEpicAscendAnimation(floor, color) {
    // Fullscreen Overlay erstellen
    const overlay = document.createElement('div');
    overlay.className = 'ascend-overlay';
    overlay.innerHTML = `
        <div class="ascend-content">
            <div class="ascend-icon">⬆</div>
            <div class="ascend-title">AUFSTIEG</div>
            <div class="ascend-floor" style="color: ${color}">EBENE ${floor}</div>
            <div class="ascend-subtitle">Bereit für neue Herausforderungen</div>
        </div>
        <div class="ascend-particles"></div>
        <div class="ascend-rings"></div>
        <div class="ascend-flash"></div>
    `;
    document.body.appendChild(overlay);
    
    // Partikel erstellen
    const particleContainer = overlay.querySelector('.ascend-particles');
    createAscendParticles(particleContainer, color, 60);
    
    // Ringe erstellen
    const ringsContainer = overlay.querySelector('.ascend-rings');
    createAscendRings(ringsContainer, color);
    
    // Flash Effekt
    const flash = overlay.querySelector('.ascend-flash');
    flash.style.background = color;
    
    // Animation starten
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });
    
    // Nach 2.5 Sekunden ausblenden
    setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 500);
    }, 2500);
}

function createAscendParticles(container, color, count) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'ascend-particle';
        
        // Zufällige Position am unteren Rand
        const startX = Math.random() * 100;
        const size = 4 + Math.random() * 8;
        const duration = 1.5 + Math.random() * 1.5;
        const delay = Math.random() * 0.8;
        
        particle.style.cssText = `
            left: ${startX}%;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            box-shadow: 0 0 ${size * 2}px ${color};
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
        `;
        
        container.appendChild(particle);
    }
}

function createAscendRings(container, color) {
    for (let i = 0; i < 3; i++) {
        const ring = document.createElement('div');
        ring.className = 'ascend-ring';
        ring.style.cssText = `
            border-color: ${color};
            animation-delay: ${i * 0.3}s;
        `;
        container.appendChild(ring);
    }
}

export function switchMainTab(tab) {
    const navModi = document.getElementById('navModi');
    const navTower = document.getElementById('navTower');
    const viewModes = document.getElementById('viewModes');
    const viewTower = document.getElementById('viewTower');

    if(navModi) navModi.classList.toggle('active', tab === 'modes');
    if(navTower) navTower.classList.toggle('active', tab === 'tower');
    if(viewModes) viewModes.classList.toggle('hidden', tab !== 'modes');
    if(viewTower) viewTower.classList.toggle('hidden', tab !== 'tower');
}

// Hilfsfunktion: Wandelt Selects um, sodass im geschlossenen Zustand "Label Wert" steht
function initSelectLabels(container) {
    const selects = container.querySelectorAll('select[data-label]');
    
    selects.forEach(select => {
        const label = select.dataset.label;
        const wrapper = document.createElement('div');
        wrapper.className = 'select-wrapper';
        
        // Erstelle Display-Element für den geschlossenen Zustand
        const display = document.createElement('div');
        display.className = 'select-display';
        
        // Funktion um Display zu aktualisieren
        const updateDisplay = () => {
            const selectedOption = select.options[select.selectedIndex];
            display.textContent = `${label} ${selectedOption.text}`;
        };
        
        // Initial setzen
        updateDisplay();
        
        // Bei Änderung aktualisieren
        select.addEventListener('change', updateDisplay);
        
        // Wrapper einfügen
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(display);
        wrapper.appendChild(select);
        
        // Click auf Display öffnet Select
        display.addEventListener('click', () => {
            select.focus();
            // Simuliere Click um Dropdown zu öffnen
            const event = new MouseEvent('mousedown', { bubbles: true });
            select.dispatchEvent(event);
        });
    });
}