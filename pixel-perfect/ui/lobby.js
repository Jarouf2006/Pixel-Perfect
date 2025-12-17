// /ui/lobby.js

const XP_PER_LEVEL = 5000;

export function updateMenuProfile(user) {
    // Sicherheitscheck, falls Elemente noch nicht geladen sind
    const nameEl = document.getElementById('arcName');
    const lvlEl = document.getElementById('arcLevel');
    
    if (nameEl) nameEl.innerText = user.name;
    if (lvlEl) lvlEl.innerText = user.level;
    
    const c = document.getElementById('arcProgress');
    if (c) {
        const r = c.r.baseVal.value;
        const cf = r * 2 * Math.PI;
        c.style.strokeDasharray = `${cf} ${cf}`;
        
        const curLvlXp = (user.level - 1) * XP_PER_LEVEL;
        const xpIn = user.xp - curLvlXp;
        const p = Math.min(100, Math.max(0, (xpIn / XP_PER_LEVEL) * 100));
        
        c.style.strokeDashoffset = cf - (p / 100) * cf;
    }
    
    const xpMissing = XP_PER_LEVEL - (user.xp - ((user.level - 1) * XP_PER_LEVEL));
    const tooltip = document.getElementById('xpTooltip');
    if (tooltip) tooltip.innerText = `Noch ${xpMissing} XP bis Level ${user.level + 1}`;
}

export function showAuth() {
    // Versteckt Startscreen, zeigt Login
    const start = document.getElementById('startScreen');
    const auth = document.getElementById('authOverlay');
    const intro = document.getElementById('introOverlay');

    if(start) start.classList.add('hidden');
    if(intro) intro.classList.add('hidden'); // Auch Intro wegmachen
    if(auth) auth.classList.remove('hidden');
}

export function hideAuth() {
    // Versteckt Login, zeigt Startscreen
    const auth = document.getElementById('authOverlay');
    const start = document.getElementById('startScreen');
    const intro = document.getElementById('introOverlay');

    if(auth) auth.classList.add('hidden');
    if(intro) intro.classList.add('hidden');
    if(start) start.classList.remove('hidden');
}

export function checkEasterEggs(name) {
    document.body.className = '';
    if(!name) return;
    
    const n = name.toLowerCase();
    if (n === 'glitch') document.body.classList.add('theme-glitch');
    else if (n === 'matrix') document.body.classList.add('theme-matrix');
    else if (n === 'disco') document.body.classList.add('theme-disco');
}

export function triggerXPAnim() {
    const el = document.getElementById('arcLevel');
    if(!el) return;

    el.classList.remove('level-anim');
    void el.offsetWidth; // Trigger Reflow
    el.classList.add('level-anim');
    
    const container = document.querySelector('.arc-profile-container');
    if(!container) return;

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