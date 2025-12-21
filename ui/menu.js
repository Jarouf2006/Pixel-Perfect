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
        title.style.filter = "";
        
        let grad = "";
        let glowColor = "rgba(52, 211, 153, 0.6)"; // Default grün
        
        // Seamless loop gradients - Pattern wiederholt sich für nahtlose Animation
        if (mode === 'normal') {
            grad = "linear-gradient(90deg, #60a5fa, #34d399, #9fe8c9, #34d399, #60a5fa, #34d399, #9fe8c9, #34d399, #60a5fa)";
            glowColor = "rgba(52, 211, 153, 0.6)";
        }
        else if (mode === 'turnier') {
            grad = "linear-gradient(90deg, #ef4444, #f59e0b, #fcd34d, #f59e0b, #ef4444, #f59e0b, #fcd34d, #f59e0b, #ef4444)";
            glowColor = "rgba(239, 68, 68, 0.6)";
        }
        else if (mode === 'blitz') {
            grad = "linear-gradient(90deg, #f59e0b, #fbbf24, #fef08a, #fbbf24, #f59e0b, #fbbf24, #fef08a, #fbbf24, #f59e0b)";
            glowColor = "rgba(245, 158, 11, 0.6)";
        }
        else if (mode === 'hunter') {
            grad = "linear-gradient(90deg, #06b6d4, #22d3ee, #a5f3fc, #22d3ee, #06b6d4, #22d3ee, #a5f3fc, #22d3ee, #06b6d4)";
            glowColor = "rgba(6, 182, 212, 0.6)";
        }
        else if (mode === 'pulsar') {
            grad = "linear-gradient(90deg, #d946ef, #e879f9, #f5d0fe, #e879f9, #d946ef, #e879f9, #f5d0fe, #e879f9, #d946ef)";
            glowColor = "rgba(217, 70, 239, 0.6)";
        }
        else if (mode === 'blueprint') {
            grad = "linear-gradient(90deg, #3b82f6, #60a5fa, #bfdbfe, #60a5fa, #3b82f6, #60a5fa, #bfdbfe, #60a5fa, #3b82f6)";
            glowColor = "rgba(59, 130, 246, 0.6)";
        }
        else if (mode === 'spotlight') {
            grad = "linear-gradient(90deg, #64748b, #94a3b8, #e2e8f0, #94a3b8, #64748b, #94a3b8, #e2e8f0, #94a3b8, #64748b)";
            glowColor = "rgba(100, 116, 139, 0.6)";
        }
        else if (mode === 'magnet') {
            grad = "linear-gradient(90deg, #f97316, #fb923c, #fed7aa, #fb923c, #f97316, #fb923c, #fed7aa, #fb923c, #f97316)";
            glowColor = "rgba(249, 115, 22, 0.6)";
        }
        else if (mode === 'glitch') {
            grad = "linear-gradient(90deg, #a855f7, #c084fc, #e9d5ff, #c084fc, #a855f7, #c084fc, #e9d5ff, #c084fc, #a855f7)";
            glowColor = "rgba(168, 85, 247, 0.6)";
        }
        else if (mode === 'mirage') {
            grad = "linear-gradient(90deg, #14b8a6, #2dd4bf, #99f6e4, #2dd4bf, #14b8a6, #2dd4bf, #99f6e4, #2dd4bf, #14b8a6)";
            glowColor = "rgba(20, 184, 166, 0.6)";
        }
        else if (mode === 'mirror') {
            grad = "linear-gradient(90deg, #94a3b8, #cbd5e1, #f8fafc, #cbd5e1, #94a3b8, #cbd5e1, #f8fafc, #cbd5e1, #94a3b8)";
            glowColor = "rgba(148, 163, 184, 0.6)";
        }
        else if (mode === 'custom') {
            grad = "linear-gradient(90deg, #8b5cf6, #a78bfa, #ddd6fe, #a78bfa, #8b5cf6, #a78bfa, #ddd6fe, #a78bfa, #8b5cf6)";
            glowColor = "rgba(139, 92, 246, 0.6)";
        }
        
        if (grad) {
            title.style.background = grad;
            title.style.backgroundSize = "200% 100%";
            title.style.webkitBackgroundClip = "text"; 
            title.style.webkitTextFillColor = "transparent";
            title.style.setProperty('--glow-color', glowColor);
        }
    }
}

export function updateTowerUI(floor, maxFloor, config, themeColor, onStart) {
    const view = document.getElementById('viewTower');
    if(!view) return;

    const bgGlow = `radial-gradient(circle at center, ${themeColor}20 0%, transparent 70%)`;
    
    view.innerHTML = `
        <div style="position:absolute; inset:0; background: ${bgGlow}; pointer-events:none;"></div>
        <div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; z-index:2;">
            <div style="font-size: 80px; margin-bottom: 20px; filter: drop-shadow(0 0 20px ${themeColor});">🗼</div>
            
            <h2 style="color: ${themeColor}; text-transform: uppercase; font-size: 32px; margin-bottom: 5px;">Ebene ${floor}</h2>
            <div style="color: #64748b; font-size: 14px; margin-bottom: 30px; font-weight:bold;">REKORD: ${maxFloor || 1}</div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; text-align:center;">
                <div>
                    <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Ziel</div>
                    <div style="font-size: 24px; font-weight: bold; color: #fff;">${config.target}</div>
                </div>
                <div>
                    <div style="font-size: 10px; color: #64748b; text-transform: uppercase;">Gefahr</div>
                    <div style="font-size: 24px; font-weight: bold; color: #fff;">${config.movement !== 'off' ? 'HOCH' : 'NORMAL'}</div>
                </div>
            </div>
            
            <button class="btn" id="startTowerBtn">BETRETEN</button>
        </div>
    `;
    
    setTimeout(() => {
        const btn = document.getElementById('startTowerBtn');
        if(btn) btn.onclick = onStart;
    }, 0);
    
    view.classList.remove('hidden');
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