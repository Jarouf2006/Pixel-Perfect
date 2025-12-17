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
    const btn = document.getElementById('startBtn');

    if (settingsArea) settingsArea.classList.remove('hidden');
    
    const modeData = MODES.find(m => m.id === mode);
    if (descArea && modeData) {
        // Name in Bold + Description
        descArea.innerHTML = `<strong style="font-size:18px; color:#fff; display:block; margin-bottom:10px;">${modeData.name.toUpperCase()}</strong>${modeData.desc}`;
    }

    if (settingsArea) {
        if (mode === 'normal') {
            settingsArea.innerHTML = `
                <div class="setting-group"><label>Größe</label><select id="sizeSelect" class="edgeless-select"><option value="large">Groß (Einfach)</option><option value="medium" selected>Mittel</option><option value="small">Klein (Schwer)</option></select></div>
                <div class="setting-group" style="margin-top:10px;"><label>Abstraktion</label><select id="compSelect" class="edgeless-select"><option value="simple">Simpel</option><option value="medium" selected>Normal</option><option value="chaos">Chaos</option></select></div>`;
        } else if (mode === 'blitz') {
            settingsArea.innerHTML = `<div class="switch-container" style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;"><span class="switch-label" style="font-weight:bold; color:#ef4444;">🔥 BLITZ EXTREME</span><input type="checkbox" id="extremeToggle" ${blitzExtreme ? 'checked' : ''}></div>`;
        } else if (mode === 'custom') {
            // Compact 2-column layout for custom settings since space is limited vertically
            settingsArea.innerHTML = `
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                    <div class="setting-group"><label>Größe</label><select id="c_size" class="edgeless-select"><option value="medium">Mittel</option><option value="small">Klein</option><option value="large">Groß</option></select></div>
                    <div class="setting-group"><label>Rotation</label><select id="c_rot" class="edgeless-select"><option value="off">Aus</option><option value="slow">Langsam</option><option value="fast">Schnell</option></select></div>
                    <div class="setting-group"><label>Zeit</label><select id="c_time" class="edgeless-select"><option value="off">Keins</option><option value="3000">3 Sek</option></select></div>
                    <div class="setting-group"><label>Sicht</label><select id="c_vis" class="edgeless-select"><option value="normal">Normal</option><option value="blitz">Blitz</option></select></div>
                </div>`;
        } else {
            settingsArea.innerHTML = ``; 
        }
    }
    
    if (title) {
        title.style.background = ""; 
        title.style.webkitTextFillColor = ""; 
        
        let grad = "";
        if (mode === 'hunter') grad = "linear-gradient(to right, #06b6d4, #22d3ee)";
        else if (mode === 'turnier') grad = "linear-gradient(to right, #ef4444, #f59e0b)";
        else if (mode === 'blitz') grad = "linear-gradient(to right, #f59e0b, #fbbf24)";
        else if (mode === 'pulsar') grad = "linear-gradient(to right, #d946ef, #e879f9)";
        else if (mode === 'glitch') grad = "linear-gradient(to right, #a855f7, #c084fc)";
        
        if(grad) {
            title.style.background = grad;
            title.style.webkitBackgroundClip = "text"; 
            title.style.webkitTextFillColor = "transparent"; 
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