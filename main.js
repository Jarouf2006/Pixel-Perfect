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
const XP_PER_LEVEL = 5000; 

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
    pulsarPhase: 0, miragePhase: 0, towerFloor: 1, towerTarget: 0, towerAscended: false, towerColor: '#3b82f6',
    currentSettings: {}, input: setupInput(canvas), startTime: 0, result: null,
    frozen: false, frozenTime: 0, lastDistance: null,
    // Perfect Coins tracking (earned this game)
    perfectCoinsThisGame: 0
};

// --- INIT ---
function initApp() {
    state.user = API.loadUser();
    
    // Load perfectCoins from user (falls vorhanden)
    if (state.user && state.user.perfectCoins === undefined) {
        // User exists but has no perfectCoins - initialize it
        state.user.perfectCoins = 0;
    }
    
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
window.devLevelUp = () => { 
    if(state.user.name.toLowerCase() === 'liam') { 
        state.user.xp += 50000; // 10 Levels bei 5000 XP pro Level
        state.user.level = 1 + Math.floor(state.user.xp / XP_PER_LEVEL);
        API.saveUser(state.user); 
        initApp(); 
    } 
};

window.titleClickEffect = (event) => {
    const title = document.getElementById('mainTitle');
    if (!title) return;
    
    // Pop Animation
    title.classList.remove('title-pop');
    void title.offsetWidth;
    title.classList.add('title-pop');
    
    // Mode-specific particle colors (matching the gradient end colors)
    const modeColors = {
        'normal': '#60a5fa',     // Blue
        'turnier': '#f59e0b',    // Orange/Amber
        'blitz': '#fbbf24',      // Yellow
        'hunter': '#22d3ee',     // Cyan
        'pulsar': '#e879f9',     // Pink
        'blueprint': '#60a5fa',  // Blue
        'spotlight': '#94a3b8',  // Gray
        'magnet': '#fb923c',     // Orange
        'glitch': '#c084fc',     // Purple
        'mirage': '#2dd4bf',     // Teal
        'mirror': '#cbd5e1',     // Light Gray
        'custom': '#a78bfa',     // Violet
        'tower': '#3b82f6'       // Blue (default tower)
    };
    const particleColor = modeColors[state.mode] || '#60a5fa';
    
    const rect = title.getBoundingClientRect();
    
    // Spawn particles from click position
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'title-particle';
        particle.style.background = particleColor;
        particle.style.boxShadow = `0 0 6px ${particleColor}, 0 0 10px ${particleColor}`;
        particle.style.left = (event.clientX - rect.left) + 'px';
        particle.style.top = (event.clientY - rect.top) + 'px';
        title.appendChild(particle);
        
        const angle = (Math.PI * 2 / 12) * i + Math.random() * 0.5;
        const speed = 3 + Math.random() * 4;
        let vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed;
        let life = 1;
        
        function animate() {
            if (life <= 0) {
                particle.remove();
            } else {
                life -= 0.025;
                particle.style.left = (parseFloat(particle.style.left) + vx) + 'px';
                particle.style.top = (parseFloat(particle.style.top) + vy) + 'px';
                particle.style.opacity = life;
                particle.style.transform = `scale(${life})`;
                vx *= 0.96;
                vy *= 0.96;
                vy += 0.15; // Gravity
                requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
    }
};

// Track if shimmer is currently animating
let coinShimmerAnimating = false;

window.coinClickEffect = (event) => {
    const coinDisplay = document.getElementById('perfectCoinsDisplay');
    if (!coinDisplay) return;
    
    event.stopPropagation(); // Prevent triggering parent clicks
    
    // Scale pop effect (like title)
    coinDisplay.classList.remove('coin-pop');
    void coinDisplay.offsetWidth; // Trigger reflow
    coinDisplay.classList.add('coin-pop');
    
    // Trigger shimmer animation only if not already animating
    if (!coinShimmerAnimating) {
        coinShimmerAnimating = true;
        coinDisplay.classList.add('shimmer-once');
        
        // Remove class and allow re-trigger after animation completes (600ms)
        setTimeout(() => {
            coinDisplay.classList.remove('shimmer-once');
            coinShimmerAnimating = false;
        }, 600);
    }
};

window.backToMenu = () => {
    const wasInTower = state.mode === 'tower';
    
    // Streak-Logik: Wenn dieses Spiel mindestens einen Perfect hatte, Streak erhöhen
    // Save perfectCoins earned this game to user
    if (state.user && state.perfectCoinsThisGame > 0) {
        state.user.perfectCoins = (state.user.perfectCoins || 0) + state.perfectCoinsThisGame;
        console.log('Earned', state.perfectCoinsThisGame, 'Perfect Coins! Total:', state.user.perfectCoins);
        API.saveUser(state.user);
    }
    
    state.isRunning = false; state.vertices = []; state.result = null; state.input.clicked = false;
    canvas.classList.remove('hide-cursor');
    
    // WICHTIG: Kasten-Look entfernen (wieder Edgeless machen)
    canvas.classList.remove('ingame');
    
    // Game Container verstecken
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) {
        gameContainer.classList.add('hidden');
    }
    
    // HUD und Timer verstecken
    const gameHud = document.getElementById('gameHud');
    if (gameHud) {
        gameHud.classList.add('invisible');
        gameHud.style.display = 'none';
    }
    const timerContainer = document.getElementById('timerContainer');
    if (timerContainer) {
        timerContainer.classList.remove('active');
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    initApp();
    
    // Nach Tower-Spiel zurück zum Tower Tab
    if (wasInTower) {
        setTimeout(() => window.switchMainTab('tower'), 50);
    }
};

window.switchMainTab = (tab) => {
    if (tab === 'tower') {
        state.mode = 'tower';
        const config = getTowerConfig(state.towerFloor);
        const themeColor = getTowerColor(state.towerFloor);
        MenuUI.updateTowerUI(
            state.towerFloor, 
            state.user.towerMax, 
            config, 
            themeColor, 
            window.startGame,
            state.user.name,
            state.towerAscended
        );
        // Titel Farbe an Tower-Ebene anpassen
        MenuUI.updateTitleForTower(themeColor);
        
        // Update coin display color to match tower
        LobbyUI.updateCoinDisplayColor('tower', themeColor);
        
        state.towerAscended = false; // Reset nach Anzeige
        
        // Dev Skip Button Listener
        setTimeout(() => {
            const devBtn = document.getElementById('devSkipBtn');
            if (devBtn) devBtn.onclick = window.devSkipLevel;
        }, 0);
    } else { 
        setMode(state.lastMode); 
    }
    MenuUI.switchMainTab(tab);
};

window.devSkipLevel = () => {
    if (!state.user || state.user.name.toLowerCase() !== 'liam') return;
    
    if (state.towerFloor >= 30) {
        // Bei Level 30 -> Win simulieren
        state.score = getTowerConfig(30).target + 1000;
        state.towerTarget = getTowerConfig(30).target;
        state.mode = 'tower';
        document.getElementById('startScreen').classList.add('hidden');
        endGame();
        return;
    }
    
    state.towerFloor = Math.min(30, state.towerFloor + 10);
    if (state.towerFloor > state.user.towerMax) state.user.towerMax = state.towerFloor;
    state.towerAscended = true;
    API.saveUser(state.user);
    window.switchMainTab('tower');
};

window.nextRound = () => { 
    if (state.round < state.maxRounds) { 
        state.round++; 
        updateHUD(); 
        startRound(); 
    } else { 
        endGame(); 
    } 
};

window.startGame = () => {
    if (state.mode === 'tower') { 
        state.currentSettings = getTowerConfig(state.towerFloor); 
        state.towerTarget = state.currentSettings.target;
        state.towerColor = getTowerColor(state.towerFloor); // Farbe für Rendering
    } 
    else if (state.mode === 'custom') { state.currentSettings = getCustomSettings(); } 
    else {
        state.currentSettings = { ...MODE_PRESETS[state.mode] || MODE_PRESETS.normal };
        // Größe und Abstraktion für alle Modi (außer Blitz) anwenden
        if (state.mode !== 'blitz') {
            state.currentSettings.size = document.getElementById('sizeSelect')?.value || state.currentSettings.size || 'medium';
            state.currentSettings.complexity = document.getElementById('compSelect')?.value || state.currentSettings.complexity || 'medium';
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

    state.score = 0; state.round = 1; state.lastDistance = null;
    // Reset Perfect Coins für dieses Spiel
    state.perfectCoinsThisGame = 0;
    
    document.getElementById('startScreen').classList.add('hidden');
    
    // Game Container anzeigen
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) {
        gameContainer.classList.remove('hidden');
    }
    
    // HUD anzeigen (war durch initApp versteckt)
    const gameHud = document.getElementById('gameHud');
    if (gameHud) {
        gameHud.classList.remove('invisible');
        gameHud.style.display = 'flex';
    }
    
    // Modus Badge updaten
    const modeBadge = document.getElementById('modeBadge');
    if (modeBadge) {
        let modeName = state.mode.toUpperCase();
        if (state.mode === 'tower') modeName = `EBENE ${state.towerFloor}`;
        if (state.mode === 'blitz' && state.blitzExtreme) modeName = 'EXTREME';
        modeBadge.innerText = modeName;
    }
    
    // Timer anzeigen wenn aktiv (außer bei Blitz - wird später von timer.js gesteuert)
    const timerContainer = document.getElementById('timerContainer');
    if (timerContainer) {
        if (state.currentSettings.timer !== 'off') {
            // Bei Blitz wird der Timer erst in der Input-Phase sichtbar
            if (state.currentSettings.visibility === 'blitz') {
                timerContainer.classList.remove('active');
            } else {
                timerContainer.classList.add('active');
            }
        } else {
            timerContainer.classList.remove('active');
        }
    }
    
    updateHUD();
    startRound();
    if (!state.isRunning) { state.isRunning = true; requestAnimationFrame(gameLoop); }
};

// --- LOGIC ---
function setMode(modeId) {
    state.mode = modeId;
    if (modeId !== 'tower') state.lastMode = modeId;
    
    // FIX: Update active class auf Mode-Cards
    document.querySelectorAll('.mode-card').forEach(card => {
        const cardModeId = card.id.replace('card_', '');
        card.classList.toggle('active', cardModeId === modeId);
    });
    
    MenuUI.updateSettingsUI(modeId, state.blitzExtreme);
    const toggle = document.getElementById('extremeToggle');
    if(toggle) toggle.onchange = () => { state.blitzExtreme = toggle.checked; setMode('blitz'); };
    
    // Update coin display color to match mode
    LobbyUI.updateCoinDisplayColor(modeId);
}

function startRound() {
    document.getElementById('nextOverlay').classList.add('hidden');
    state.result = null;
    state.frozen = false; // Reset frozen state für neue Runde
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
    
    // Nur updaten wenn nicht frozen (nach Klick)
    if (!state.frozen) {
        if (state.currentSettings.special === 'pulsar') state.pulsarPhase += 0.05;
        if (state.currentSettings.special === 'mirage') state.miragePhase += 0.02 + (state.round * 0.015);

        // Hunter movement only when shape is visible (not during blitz countdown)
        const isBlitzCountdown = state.blitzPhase === 'countdown';
        if (state.currentSettings.movement === 'hunter' && !isBlitzCountdown) {
            state.centerPos.x += state.velocity.x;
            state.centerPos.y += state.velocity.y;
            
            // WICHTIG: Bouncing an den dynamischen Rändern (Puffer 100px)
            const bounceMargin = 100;
            if (state.centerPos.x < bounceMargin || state.centerPos.x > canvas.width - bounceMargin) state.velocity.x *= -1;
            if (state.centerPos.y < bounceMargin || state.centerPos.y > canvas.height - bounceMargin) state.velocity.y *= -1;
        }

        // Rotation only when shape is visible (flash phase in blitz, or no blitz)
        if (state.currentSettings.rotation !== 'off' && !isBlitzCountdown) {
            state.rotation += state.rotationSpeed;
        }
    }
    
    // Timer nur updaten wenn nicht frozen
    const timeUp = state.frozen ? false : updateTimerUI(state.currentSettings, state.startTime, state.blitzEndTime, state.blitzPhase);
    
    if (state.currentSettings.visibility === 'blitz' && !state.frozen) {
        const now = Date.now();
        if (now < state.blitzEndTime) state.blitzPhase = 'countdown';
        else if (now < state.blitzEndTime + 250) state.blitzPhase = 'flash';
        else state.blitzPhase = 'input';
    }

    if (state.waitingForClick) {
        if (timeUp) { handleRoundEnd(999); } 
        else if (state.input.clicked && !state.frozen) {
            const isBlitz = state.currentSettings.visibility === 'blitz';
            if (!isBlitz || (isBlitz && state.blitzPhase === 'input')) {
                // FREEZE: Stoppe alles sofort nach Klick
                state.frozen = true;
                state.frozenTime = Date.now();
                
                const hitData = calculateHit(state.input, state.centerPos, state.rotation, state.vertices);
                handleRoundEnd(hitData.dist, hitData.targetX, hitData.targetY);
            }
            resetInputClick(state.input);
        }
    }
    renderGame(ctx, state);
    requestAnimationFrame(gameLoop);
}

// Keyboard shortcuts for game
document.addEventListener('keydown', (e) => {
    // Skip popups with Enter or Space
    if (e.key === 'Enter' || e.key === ' ') {
        // Check if round result popup is visible
        const nextOverlay = document.getElementById('nextOverlay');
        if (nextOverlay && !nextOverlay.classList.contains('hidden')) {
            e.preventDefault();
            const nextBtn = document.getElementById('nextBtn');
            if (nextBtn) nextBtn.click();
            return;
        }
        
        // Check if end screen is visible
        const endScreen = document.getElementById('endScreen');
        if (endScreen && !endScreen.classList.contains('hidden')) {
            e.preventDefault();
            const backBtn = endScreen.querySelector('.btn');
            if (backBtn) backBtn.click();
            return;
        }
    }
    
    // DEV CHEAT: Enter key for perfect hit (only for Liam)
    if (e.key === 'Enter' && state.user && state.user.name.toLowerCase() === 'liam') {
        if (state.isRunning && state.waitingForClick && !state.frozen) {
            const isBlitz = state.currentSettings.visibility === 'blitz';
            if (!isBlitz || (isBlitz && state.blitzPhase === 'input')) {
                // FREEZE
                state.frozen = true;
                state.frozenTime = Date.now();
                
                // Calculate perfect target position
                const centroid = getCentroid(state.vertices);
                const wCos = Math.cos(state.rotation);
                const wSin = Math.sin(state.rotation);
                const targetX = state.centerPos.x + (centroid.x * wCos - centroid.y * wSin);
                const targetY = state.centerPos.y + (centroid.x * wSin + centroid.y * wCos);
                
                // Set input position to perfect spot
                state.input.deflectedX = targetX;
                state.input.deflectedY = targetY;
                
                // Perfect hit = 0 distance
                handleRoundEnd(0, targetX, targetY);
                console.log('🎯 DEV CHEAT: Perfect hit!');
            }
        }
    }
});

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
    
    // Perfect Coin Tracking (Perfekt = dist < 4px)
    const isPerfect = dist < 4;
    
    if (isPerfect) {
        state.perfectCoinsThisGame++;
        console.log('PERFECT HIT! +1 Perfect Coin this game. Total this game:', state.perfectCoinsThisGame);
    }
    
    updateHUD(dist < 900 ? dist : null);
    if(dist < 900) { state.result = { clickX: state.input.deflectedX, clickY: state.input.deflectedY, targetX: tx, targetY: ty, dist: dist }; }
    setTimeout(() => { LeaderboardUI.showRoundResult(points, dist, state.round, state.maxRounds, window.nextRound, isPerfect); }, 1000);
}

function endGame() {
    state.isRunning = false;
    
    // HUD und Timer bleiben sichtbar während End Screen!
    // Werden erst in backToMenu() versteckt
    
    document.getElementById('nextOverlay').classList.add('hidden');
    let earnedXp = state.score; let towerSuccess = false;
    if (state.mode === 'tower') {
        towerSuccess = state.score >= state.towerTarget;
        if (towerSuccess) { 
            state.towerFloor++; 
            if (state.towerFloor > state.user.towerMax) state.user.towerMax = state.towerFloor;
            state.towerAscended = true; // Animation beim nächsten Tower-Aufruf
        } 
        else { 
            state.towerFloor = 1; 
        }
    }
    state.user.xp += earnedXp;
    state.user.level = 1 + Math.floor(state.user.xp / XP_PER_LEVEL);
    API.saveUser(state.user);
    LeaderboardUI.showEndScreen(state.score, earnedXp, state.mode === 'tower', towerSuccess, state.towerFloor, window.backToMenu, state.perfectCoinsThisGame);
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
    // Nur updaten wenn dist übergeben wurde, sonst letzten Wert behalten
    if (dist !== undefined) {
        state.lastDistance = dist;
    }
    document.getElementById('lastDistance').innerText = state.lastDistance ? state.lastDistance.toFixed(1) + "px" : "-";
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