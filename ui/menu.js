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
        
        if (mode === 'normal') {
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
            // FIX: Wenige Settings -> verteilen
            settingsArea.classList.add('distribute');
            initSelectLabels(settingsArea);
            
        } else if (mode === 'blitz') {
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
            // Andere Modi ohne Settings -> leere Box, zentriert
            settingsArea.innerHTML = `<div style="color: #64748b; text-align: center; font-size: 14px;">Keine Einstellungen für diesen Modus</div>`;
            settingsArea.classList.add('distribute');
        }
    }
    
    if (title) {
        // Reset styles
        title.style.background = ""; 
        title.style.webkitTextFillColor = ""; 
        
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
            title.style.background = grad;
            title.style.webkitBackgroundClip = "text"; 
            title.style.webkitTextFillColor = "transparent";
            title.style.setProperty('--glow-color', glowColor);
        }
    }
}

export function updateTowerUI(floor, maxFloor, config, themeColor, onStart, userName, towerAscended) {
    const view = document.getElementById('viewTower');
    if(!view) return;

    const bgCol = themeColor + '20';
    const borderCol = themeColor + '60';
    
    let bgStyle = `background: ${bgCol};`;
    let animClass = "";
    let contentClass = "";
    let cardAnimClass = "";
    
    // Animation wenn aufgestiegen
    if (towerAscended) {
        const prevColor = floor > 1 ? getTowerColor(floor - 1) : themeColor;
        const gradStart = `${themeColor}30`;
        const gradEnd = `${prevColor}30`;
        bgStyle = `background: linear-gradient(to bottom, ${gradStart} 0%, ${gradStart} 40%, ${gradEnd} 60%, ${gradEnd} 100%); background-size: 100% 250%; background-position: 0% 100%;`;
        animClass = "tower-animating-bg";
        contentClass = "tower-content-fade";
        cardAnimClass = "tower-card-anim";
    }
    
    // Dev Button nur für Liam
    let devBtn = '';
    if (userName && userName.toLowerCase() === 'liam') {
        devBtn = `<button class="btn tower-dev-btn" id="devSkipBtn">🚧 DEV: SKIP 10 LEVELS 🚧</button>`;
    }

    // Rekord Anzeige mit Pokal wenn Level 30 erreicht
    let recordDisplay = `Rekord: Ebene ${maxFloor || 1}`;
    if (maxFloor >= 30) recordDisplay += " 🏆";

    view.innerHTML = `
        <div class="tower-elevator-bg ${animClass}" style="${bgStyle}"></div>
        <div class="tower-content ${contentClass}">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 60px; margin-bottom: 10px; filter: drop-shadow(0 0 10px ${themeColor});" id="towerLevelIcon">🗼</div>
                <h2 style="font-size: 32px; color: ${themeColor}; margin-bottom: 5px; text-transform: uppercase; font-style: italic;" id="towerLevelText">Ebene ${floor}</h2>
                
                <div style="color: #94a3b8; font-size: 14px; margin-bottom: 2px;">${recordDisplay}</div>
                <div style="color: #64748b; font-size: 12px; margin-bottom: 15px;">(Max. Ebene 30)</div>
                <div style="font-size: 12px; color: #fbbf24; font-weight: bold; margin-bottom: 20px; letter-spacing: 1px;">✨ EXKLUSIVE BELOHNUNGEN ✨</div>
                
                <div class="tower-card ${cardAnimClass}" style="background: rgba(0,0,0,0.3); border: 1px solid ${borderCol}; border-radius: 8px; padding: 20px; max-width: 300px; margin: 0 auto; box-shadow: 0 4px 20px ${bgCol};">
                    <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; margin-bottom: 5px;">Benötigte Punkte</div>
                    <div style="font-size: 32px; font-weight: bold; color: #fff; margin-bottom: 15px;">${config.target}</div>
                    <div style="text-align: left; border-top: 1px solid ${borderCol}; padding-top: 15px;">
                        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 5px;">Gefahren:</div>
                        <ul style="padding-left: 20px; margin: 0; color: #e2e8f0; font-size: 13px; list-style: disc;">
                            <li>Größe: <strong>${config.size.toUpperCase()}</strong></li>
                            <li>Rotation: <strong>${config.rotation.toUpperCase()}</strong></li>
                            ${config.movement !== 'off' ? `<li style="color:${themeColor}">⚠ HUNTER AKTIV</li>` : ''}
                            ${config.style === 'spotlight' ? `<li style="color:#94a3b8">⚠ DUNKELHEIT</li>` : ''}
                            ${config.cursor === 'magnet' ? `<li style="color:#f97316">⚠ MAGNET FELD</li>` : ''}
                            ${config.cursor === 'mirror' ? `<li style="color:#e2e8f0">⚠ SPIEGELUNG</li>` : ''}
                        </ul>
                    </div>
                </div>
            </div>
            
            <button class="btn ${cardAnimClass}" id="startTowerBtn" style="background-color: ${themeColor}; background-image: linear-gradient(135deg, rgba(255,255,255,0.25), rgba(0,0,0,0.1)); border-color: ${themeColor}; box-shadow: 0 4px 15px ${themeColor}66; max-width: 300px; margin: 0 auto; display: block; font-size: 20px; padding: 15px;">EBENE ${floor} BETRETEN</button>
            ${devBtn}
            ${floor > 1 ? '<div style="margin-top: 15px; color: #ef4444; font-size: 12px; text-align: center;">⚠ Bei Niederlage zurück auf Ebene 1</div>' : ''}
        </div>
        ${towerAscended ? `<div class="tower-slide-layer" style="background:${getTowerColor(floor-1 > 0 ? floor-1 : 1)}20;"></div>` : ''}
    `;
    
    // Event Listeners
    setTimeout(() => {
        const btn = document.getElementById('startTowerBtn');
        if(btn) btn.onclick = onStart;
    }, 0);
    
    // Partikel Animation wenn aufgestiegen
    if (towerAscended) {
        initTowerParticles(view, themeColor);
        setTimeout(() => triggerTowerTextParticles(view, themeColor), 100);
    }
    
    view.classList.remove('hidden');
}

// Helper: Tower Color based on floor
function getTowerColor(floor) {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'];
    return colors[(floor - 1) % colors.length];
}

// Tower Partikel beim Aufstieg
function initTowerParticles(container, color) {
    const particleCount = 40;
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'tower-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.bottom = '0px';
            particle.style.color = color;
            container.appendChild(particle);
            const targetY = -(Math.random() * 400 + 100);
            const duration = 1500 + Math.random() * 1000;
            const delay = Math.random() * 500;
            animateTowerParticle(particle, targetY, duration, delay);
        }, i * 30);
    }
}

function animateTowerParticle(particle, targetY, duration, delay) {
    setTimeout(() => {
        const startTime = performance.now();
        const startY = 0;
        const startOpacity = 1;
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentY = startY + (targetY * eased);
            const currentOpacity = startOpacity * (1 - progress);
            particle.style.transform = `translateY(${currentY}px)`;
            particle.style.opacity = currentOpacity;
            if (progress < 1) requestAnimationFrame(update); 
            else particle.remove();
        }
        requestAnimationFrame(update);
    }, delay);
}

function triggerTowerTextParticles(container, color) {
    const levelText = document.getElementById('towerLevelText');
    if (!levelText) return;
    
    const rect = levelText.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const textParticle = document.createElement('div');
    textParticle.className = 'tower-text-particle';
    textParticle.innerText = '⬆ LEVEL UP';
    textParticle.style.left = (rect.left - containerRect.left + rect.width/2 - 60) + 'px';
    textParticle.style.top = (rect.top - containerRect.top - 30) + 'px';
    textParticle.style.color = color;
    container.appendChild(textParticle);
    setTimeout(() => textParticle.remove(), 2000);
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