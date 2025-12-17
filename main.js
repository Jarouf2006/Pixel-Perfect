// main.js
import { setupInput, processInputEffects, resetInputClick } from './game/input.js';
import { getCentroid, calculateScore } from './game/scoring.js';
import { renderGame } from './game/rendering.js';
import { updateTimerUI, resetTimerUI } from './game/timer.js';

import * as MenuUI from './ui/menu.js';
import * as LobbyUI from './ui/lobby.js';
import * as LeaderboardUI from './ui/leaderboard.js';
import * as API from './net/api.js';

// --- KONSTANTEN & CONFIG ---
const LEVELS = { turnier: 3, blitz: 5, hunter: 7, pulsar: 10, blueprint: 12, spotlight: 15, magnet: 18, glitch: 20, mirage: 22, mirror: 25, custom: 1 };
const XP_PER_LEVEL = 1000; 

const MODE_PRESETS = {
    normal: { size: 'medium', complexity: 'medium', rotation: 'off', timer: 'off', visibility: 'normal' },
    turnier: { size: 'small', complexity: 'chaos', rotation: 'fast', timer: '3000', visibility: 'normal' },
    blitz: { size: 'medium', complexity: 'chaos', rotation: 'off', timer: 'off', visibility: 'blitz' }, 
    hunter: { movement: 'hunter', rotation: 'off', size: 'medium', complexity: 'medium', timer: 'off', visibility: 'normal' },
    pulsar: { special: 'pulsar', rotation: 'off', size: 'medium', complexity: 'medium', timer: 'off', visibility: 'normal' },
    spotlight: { style: 'spotlight', size: 'large', rotation: 'off', complexity: 'medium', timer: 'off', visibility: 'normal' },
    magnet: { cursor: 'magnet', size: 'medium', complexity: 'medium', rotation: 'off', timer: 'off', visibility: 'normal' },
    glitch: { special: 'glitch', complexity: 'chaos', rotation: 'slow', size: 'medium', timer: 'off', visibility: 'normal' },
    mirage: { special: 'mirage', rotation: 'slow', complexity: 'medium', size: 'medium', timer: 'off', visibility: 'normal' },
    mirror: { cursor: 'mirror', size: 'medium', complexity: 'medium', rotation: 'off', timer: 'off', visibility: 'normal' },
    blueprint: { style: 'blueprint', rotation: 'off', size: 'medium', complexity: 'medium', timer: 'off', visibility: 'normal' }
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// State Setup
let state = {
    user: null, mode: 'normal', lastMode: 'normal', isRunning: false, waitingForClick: false,
    round: 1, maxRounds: 5, score: 0, vertices: [], centerPos: {x: 0, y: 0},
    rotation: 0, rotationSpeed: 0, velocity: {x: 0, y: 0},
    blitzPhase: null, blitzEndTime: 0, blitzExtreme: false,
    pulsarPhase: 0, miragePhase: 0, towerFloor: 1, towerTarget: 0,
    currentSettings: {}, input: setupInput(canvas), startTime: 0, result: null 
};

// --- INIT ---
function initApp() {
    state.user = API.loadUser();
    
    // UI Reset - WICHTIG: gameHud auch mit display:none verstecken
    ['endScreen', 'nextOverlay', 'startScreen', 'authOverlay', 'introOverlay'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.classList.add('hidden');
    });
    
    const gameHud = document.getElementById('gameHud');
    if(gameHud) {
        gameHud.classList.add('invisible');
        gameHud.style.display = 'none';
    }
    
    if (state.user) {
        document.getElementById('startScreen').classList.remove('hidden');
        LobbyUI.checkEasterEggs(state.user.name);
        LobbyUI.updateMenuProfile(state.user, XP_PER_LEVEL);
        MenuUI.buildModeGrid(state.user.level, LEVELS, state.mode, setMode);
        setMode(state.mode === 'tower' ? 'normal' : state.mode);
        MenuUI.switchMainTab('modes');
    } else {
        document.getElementById('introOverlay').classList.remove('hidden');
        setupAuthListeners();
    }
}

// --- AUTH LISTENERS SETUP ---
function setupAuthListeners() {
    const btnGuest = document.getElementById('btn-guest');
    const btnBack = document.getElementById('btn-back');
    const btnStart = document.getElementById('btn-start');
    const guestInput = document.getElementById('guest-name');
    
    // Entferne alte Listener (falls vorhanden)
    if(btnGuest) {
        btnGuest.replaceWith(btnGuest.cloneNode(true));
        document.getElementById('btn-guest').addEventListener('click', window.chooseGuest);
    }
    
    if(btnBack) {
        btnBack.replaceWith(btnBack.cloneNode(true));
        document.getElementById('btn-back').addEventListener('click', window.backToIntro);
    }
    
    if(btnStart) {
        btnStart.replaceWith(btnStart.cloneNode(true));
        document.getElementById('btn-start').addEventListener('click', handleAuthSubmit);
    }
    
    if(guestInput) {
        guestInput.replaceWith(guestInput.cloneNode(true));
        document.getElementById('guest-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleAuthSubmit();
        });
    }
}

function handleAuthSubmit() {
    const input = document.getElementById('guest-name');
    const name = input.value.trim();
    
    if (name === "") {
        input.style.borderColor = "#ef4444";
        setTimeout(() => {
            input.style.borderColor = "#334155";
        }, 500);
        return;
    }
    
    // User erstellen
    state.user = API.createDefaultUser(name);
    API.saveUser(state.user);
    
    // Auth-Screen verstecken und Menü zeigen
    document.getElementById('authOverlay').classList.add('hidden');
    initApp();
}

// --- WINDOW FUNCTIONS ---
window.chooseLogin = () => alert("Die Account-Server sind in diesem Demo-Build noch nicht verfügbar. Bitte spiele als Gast.");

window.chooseGuest = () => { 
    document.getElementById('introOverlay').classList.add('hidden'); 
    document.getElementById('authOverlay').classList.remove('hidden');
    // Fokus auf Input
    setTimeout(() => {
        const input = document.getElementById('guest-name');
        if(input) input.focus();
    }, 100);
};

window.backToIntro = () => { 
    document.getElementById('authOverlay').classList.add('hidden'); 
    document.getElementById('introOverlay').classList.remove('hidden'); 
};

window.logout = () => { API.deleteUser(); state.user = null; initApp(); };
window.triggerXPAnim = () => LobbyUI.triggerXPAnim();
window.devLevelUp = () => { if(state.user.name.toLowerCase() === 'liam') { state.user.xp += 10000; API.saveUser(state.user); initApp(); } };

window.backToMenu = () => {
    state.isRunning = false; state.vertices = []; state.result = null; state.input.clicked = false;
    canvas.classList.remove('hide-cursor');
    
    // WICHTIG: Kasten-Look entfernen (wieder Edgeless machen)
    canvas.classList.remove('ingame');
    
    // HUD verstecken
    const gameHud = document.getElementById('gameHud');
    if(gameHud) gameHud.style.display = 'none';
    
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    initApp();
};

window.switchMainTab = (tab) => {
    if (tab === 'tower') {
        state.mode = 'tower';
        const config = getTowerConfig(state.towerFloor);
        const themeColor = getTowerColor(state.towerFloor);
        MenuUI.updateTowerUI(state.towerFloor, state.user.towerMax, config, themeColor, window.startGame);
    } else { setMode(state.lastMode); }
    MenuUI.switchMainTab(tab);
};
window.nextRound = () => { if (state.round < state.maxRounds) { state.round++; updateHUD(); startRound(); } else { endGame(); } };

window.startGame = () => {
    if (state.mode === 'tower') { state.currentSettings = getTowerConfig(state.towerFloor); state.towerTarget = state.currentSettings.target; } 
    else if (state.mode === 'custom') { state.currentSettings = getCustomSettings(); } 
    else {
        state.currentSettings = { ...MODE_PRESETS[state.mode] || MODE_PRESETS.normal };
        if (state.mode === 'normal') {
            state.currentSettings.size = document.getElementById('sizeSelect')?.value || 'medium';
            state.currentSettings.complexity = document.getElementById('compSelect')?.value || 'medium';
        }
        if (state.mode === 'blitz' && state.blitzExtreme) { state.currentSettings.size = 'small'; state.currentSettings.rotation = 'fast'; state.currentSettings.timer = '3000'; }
    }
    if(!state.currentSettings.rotation) state.currentSettings.rotation = 'off';
    
    // WICHTIG: Cursor-Logik - Standard ist crosshair, außer bei speziellen Modi
    canvas.classList.remove('hide-cursor');
    if (state.currentSettings.style === 'spotlight' || state.currentSettings.cursor === 'magnet' || state.currentSettings.cursor === 'mirror') {
        canvas.classList.add('hide-cursor');
    }
    
    // WICHTIG: Jetzt den Kasten-Look aktivieren (Hintergrund dunkel machen)
    canvas.classList.add('ingame');

    state.score = 0; state.round = 1;
    document.getElementById('startScreen').classList.add('hidden');
    
    // HUD anzeigen
    const gameHud = document.getElementById('gameHud');
    if(gameHud) {
        gameHud.style.display = 'block';
        gameHud.classList.remove('invisible');
    }
    
    document.getElementById('timerContainer').style.opacity = (state.currentSettings.timer !== 'off') ? '1' : '0';
    updateHUD();
    startRound();
    if (!state.isRunning) { state.isRunning = true; requestAnimationFrame(gameLoop); }
};

// --- LOGIC ---
function setMode(modeId) {
    state.mode = modeId;
    if (modeId !== 'tower') state.lastMode = modeId;
    MenuUI.updateSettingsUI(modeId, state.blitzExtreme);
    const toggle = document.getElementById('extremeToggle');
    if(toggle) toggle.onchange = () => { state.blitzExtreme = toggle.checked; setMode('blitz'); };
}

function startRound() {
    document.getElementById('nextOverlay').classList.add('hidden');
    state.result = null;
    state.vertices = createPolygon(state.currentSettings.size, state.currentSettings.complexity);
    
    // WICHTIG: Dynamische Grenzen für 900px Breite
    const safeMargin = 150; 
    const maxX = canvas.width - safeMargin; // Nutzt canvas.width (900)
    const maxY = canvas.height - safeMargin; // Nutzt canvas.height (600)
    
    state.centerPos = { 
        x: safeMargin + Math.random() * (maxX - safeMargin), 
        y: safeMargin + Math.random() * (maxY - safeMargin) 
    };
    
    state.rotation = 0;
    state.rotationSpeed = (state.currentSettings.rotation === 'fast') ? 0.02 : (state.currentSettings.rotation === 'slow' ? 0.005 : 0);
    state.velocity = {x:0, y:0};
    if (state.currentSettings.movement === 'hunter') {
        const speed = 2.0 + (state.round * 0.5);
        const angle = Math.random() * Math.PI * 2;
        state.velocity = { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
    }
    state.waitingForClick = true;
    state.startTime = Date.now();
    state.blitzPhase = null;
    if (state.currentSettings.visibility === 'blitz') { state.blitzEndTime = Date.now() + 3000; state.blitzPhase = 'countdown'; }
    resetTimerUI();
}

function gameLoop() {
    if (!state.isRunning) return;
    processInputEffects(state.input, state.currentSettings, state.centerPos);
    if (state.currentSettings.special === 'pulsar') state.pulsarPhase += 0.05;
    if (state.currentSettings.special === 'mirage') state.miragePhase += 0.02 + (state.round * 0.015);

    if (state.currentSettings.movement === 'hunter' && (!state.blitzPhase || state.blitzPhase === 'input')) {
        state.centerPos.x += state.velocity.x;
        state.centerPos.y += state.velocity.y;
        
        // WICHTIG: Bouncing an den dynamischen Rändern (Puffer 100px)
        const bounceMargin = 100;
        if (state.centerPos.x < bounceMargin || state.centerPos.x > canvas.width - bounceMargin) state.velocity.x *= -1;
        if (state.centerPos.y < bounceMargin || state.centerPos.y > canvas.height - bounceMargin) state.velocity.y *= -1;
    }

    if (state.currentSettings.rotation !== 'off' && (!state.blitzPhase || state.blitzPhase !== 'input')) state.rotation += state.rotationSpeed;
    
    const timeUp = updateTimerUI(state.currentSettings, state.startTime, state.blitzEndTime, state.blitzPhase);
    if (state.currentSettings.visibility === 'blitz') {
        const now = Date.now();
        if (now < state.blitzEndTime) state.blitzPhase = 'countdown';
        else if (now < state.blitzEndTime + 250) state.blitzPhase = 'flash';
        else state.blitzPhase = 'input';
    }

    if (state.waitingForClick) {
        if (timeUp) { handleRoundEnd(999); } 
        else if (state.input.clicked) {
            const isBlitz = state.currentSettings.visibility === 'blitz';
            if (!isBlitz || (isBlitz && state.blitzPhase === 'input')) {
                const hitData = calculateHit(state.input, state.centerPos, state.rotation, state.vertices);
                handleRoundEnd(hitData.dist, hitData.targetX, hitData.targetY);
            }
            resetInputClick(state.input);
        }
    }
    renderGame(ctx, state);
    requestAnimationFrame(gameLoop);
}

function calculateHit(input, center, rotation, vertices) {
    const centroid = getCentroid(vertices);
    const dx = input.deflectedX - center.x;
    const dy = input.deflectedY - center.y;
    const cos = Math.cos(-rotation);
    const sin = Math.sin(-rotation);
    const rx = dx * cos - dy * sin;
    const ry = dx * sin + dy * cos;
    const dist = Math.sqrt((rx - centroid.x)**2 + (ry - centroid.y)**2);
    const wCos = Math.cos(rotation);
    const wSin = Math.sin(rotation);
    const targetX = center.x + (centroid.x * wCos - centroid.y * wSin);
    const targetY = center.y + (centroid.x * wSin + centroid.y * wCos);
    return { dist, targetX, targetY };
}

function handleRoundEnd(dist, tx = 0, ty = 0) {
    state.waitingForClick = false;
    const points = calculateScore(dist, state.currentSettings, state.mode, state.blitzExtreme);
    state.score += points;
    updateHUD(dist < 900 ? dist : null);
    if(dist < 900) { state.result = { clickX: state.input.deflectedX, clickY: state.input.deflectedY, targetX: tx, targetY: ty, dist: dist }; }
    setTimeout(() => { LeaderboardUI.showRoundResult(points, dist, state.round, state.maxRounds, window.nextRound); }, 1000);
}

function endGame() {
    state.isRunning = false;
    const gameHud = document.getElementById('gameHud');
    if(gameHud) {
        gameHud.classList.add('invisible');
        gameHud.style.display = 'none';
    }
    document.getElementById('nextOverlay').classList.add('hidden');
    let earnedXp = state.score; let towerSuccess = false;
    if (state.mode === 'tower') {
        towerSuccess = state.score >= state.towerTarget;
        if (towerSuccess) { state.towerFloor++; if (state.towerFloor > state.user.towerMax) state.user.towerMax = state.towerFloor; } 
        else { state.towerFloor = 1; }
    }
    state.user.xp += earnedXp;
    state.user.level = 1 + Math.floor(state.user.xp / XP_PER_LEVEL);
    API.saveUser(state.user);
    LeaderboardUI.showEndScreen(state.score, earnedXp, state.mode === 'tower', towerSuccess, state.towerFloor, window.backToMenu);
}

function getCustomSettings() {
    return {
        size: document.getElementById('c_size').value, complexity: document.getElementById('c_comp').value,
        rotation: document.getElementById('c_rot').value, timer: document.getElementById('c_time').value,
        visibility: document.getElementById('c_vis').value, movement: document.getElementById('c_move').value,
        special: document.getElementById('c_spec').value, style: document.getElementById('c_style').value,
        cursor: document.getElementById('c_cursor').value
    };
}
function updateHUD(dist) {
    document.getElementById('scoreDisplay').innerText = state.score;
    document.getElementById('roundDisplay').innerText = state.round;
    document.getElementById('lastDistance').innerText = dist ? dist.toFixed(1) + "px" : "-";
}
function getTowerConfig(floor) {
    let config = { size: 'large', complexity: 'simple', rotation: 'off', timer: 'off', visibility: 'normal', movement: 'off', special: 'off', style: 'normal', cursor: 'normal', target: 1000 };
    config.target = Math.min(4900, 1000 + (floor * 130));
    if (floor >= 3) config.complexity = 'medium'; if (floor >= 8) config.rotation = 'slow'; if (floor >= 12) config.size = 'small'; if (floor >= 20) config.timer = '3000';
    const specialLevels = { 5: {movement:'hunter'}, 10: {style:'spotlight'}, 15: {cursor:'magnet'}, 20: {special:'glitch'}, 25: {special:'mirage'} };
    if (specialLevels[floor]) Object.assign(config, specialLevels[floor]);
    return config;
}
function getTowerColor(floor) { const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']; return colors[(floor - 1) % colors.length]; }
function createPolygon(size, complexity) {
    let minR = 70, maxR = 180;
    if (size === 'small') { minR = 30; maxR = 90; } else if (size === 'large') { minR = 120; maxR = 220; }
    let minP = 5, maxP = 9, v = 0.25;
    if (complexity === 'simple') { minP = 3; maxP = 5; v = 0.1; } else if (complexity === 'chaos') { minP = 8; maxP = 14; v = 0.5; }
    const points = Math.floor(Math.random() * (maxP - minP + 1)) + minP;
    const vs = []; const step = (Math.PI * 2) / points;
    for (let i = 0; i < points; i++) {
        const angle = i * step + (Math.random() * v * 2 - v);
        const r = minR + Math.random() * (maxR - minR);
        vs.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
    }
    return vs;
}

initApp();