// /game/rendering.js

export function renderGame(ctx, gameState) {
    const { width, height } = ctx.canvas;
    const { currentSettings: settings, centerPos, vertices, rotation, input, blitzPhase, mode, blitzExtreme, pulsarPhase, miragePhase, result } = gameState;

    if (!settings || !vertices) return;

    const isBlitz = settings.visibility === 'blitz';
    const isSpotlight = settings.style === 'spotlight';
    const isBlueprint = settings.style === 'blueprint';
    const isGlitch = settings.special === 'glitch';
    const isMirage = settings.special === 'mirage';

    // 1. Hintergrund zeichnen (WICHTIG: Überschreibt die Transparenz)
    if (isBlitz && blitzPhase === 'countdown') {
        const bgGrad = ctx.createLinearGradient(0, 0, width, 0);
        if (mode === 'blitz' && blitzExtreme) { 
            bgGrad.addColorStop(0, '#7f1d1d'); bgGrad.addColorStop(1, '#ef4444'); 
        } else { 
            bgGrad.addColorStop(0, '#f59e0b'); bgGrad.addColorStop(1, '#fbbf24'); 
        }
        ctx.fillStyle = bgGrad;
    } else if (isSpotlight) { 
        ctx.fillStyle = '#020617'; 
    } else { 
        ctx.fillStyle = '#1e293b'; 
    }
    ctx.fillRect(0, 0, width, height);

    // 2. Grid zeichnen
    if ((isBlueprint || !isSpotlight) && (!isBlitz || blitzPhase !== 'countdown')) {
        ctx.strokeStyle = isBlueprint ? '#1e40af' : '#334155'; 
        ctx.lineWidth = 1; 
        ctx.beginPath();
        for(let i=0; i<width; i+=40) { ctx.moveTo(i,0); ctx.lineTo(i,height); ctx.moveTo(0,i); ctx.lineTo(width,i); }
        ctx.stroke();
    }

    // 3. Blitz Countdown
    if (isBlitz && blitzPhase === 'countdown') {
        const left = Math.ceil((gameState.blitzEndTime - Date.now()) / 1000);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 120px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; 
        ctx.fillText(left, width/2, height/2);
        return;
    }

    // 4. Spotlight (Clipping Maske)
    if (isSpotlight) {
        ctx.save();
        ctx.beginPath();
        // Wenn ein Ergebnis da ist, zeigen wir alles, sonst nur den Spot
        if (!result) {
            ctx.arc(input.deflectedX, input.deflectedY, 120, 0, Math.PI*2);
            ctx.clip();
        }
        ctx.fillStyle = '#334155'; ctx.fillRect(0,0,width,height);
        ctx.strokeStyle = '#475569'; ctx.lineWidth = 1; ctx.beginPath();
        for(let i=0; i<width; i+=40) { ctx.moveTo(i,0); ctx.lineTo(i,height); ctx.moveTo(0,i); ctx.lineTo(width,i); }
        ctx.stroke();
    }

    // Wenn keine Vertices da sind oder Blitz-Input Phase, abbrechen (außer wir haben ein Ergebnis zu zeigen)
    if (vertices.length === 0 && !result) { if(isSpotlight) ctx.restore(); return; }
    if (isBlitz && blitzPhase === 'input' && !result) { if(isSpotlight) ctx.restore(); return; }

    // 5. Mirage Effekt
    if (isMirage) {
        const ghostCount = 1 + gameState.round;
        const driftAmp = 30 + (gameState.round * 6);
        const ghostOpacity = 0.1 + (gameState.round * 0.05);
        for(let k=1; k<=ghostCount; k++) {
            ctx.save();
            const driftX = Math.sin(miragePhase * 0.7 + k) * driftAmp;
            const driftY = Math.cos(miragePhase * 0.5 + k * 1.5) * driftAmp;
            ctx.translate(centerPos.x + driftX, centerPos.y + driftY);
            const ghostRot = rotation + Math.sin(miragePhase + k) * 0.5;
            const ghostScale = 1 + Math.sin(miragePhase * 2 + k) * 0.15;
            ctx.scale(ghostScale, ghostScale);
            ctx.rotate(ghostRot);
            ctx.beginPath();
            for (let i = 0; i < vertices.length; i++) {
                let v = vertices[i];
                if (i===0) ctx.moveTo(v.x, v.y); else ctx.lineTo(v.x, v.y);
            }
            ctx.closePath();
            ctx.strokeStyle = `rgba(20, 184, 166, ${ghostOpacity + 0.2})`;
            ctx.lineWidth = 2; ctx.stroke();
            ctx.fillStyle = `rgba(20, 184, 166, ${ghostOpacity})`; ctx.fill();
            ctx.restore();
        }
    }

    // 6. Hauptform zeichnen
    ctx.save();
    ctx.translate(centerPos.x, centerPos.y);

    if (settings.special === 'pulsar') {
        const scale = 1 + Math.sin(pulsarPhase) * 0.2;
        ctx.scale(scale, scale);
    }
    
    if (isGlitch) {
        ctx.translate((Math.random()-0.5)*10, (Math.random()-0.5)*10);
    }
    
    ctx.rotate(rotation);
    ctx.beginPath();
    
    for (let i = 0; i < vertices.length; i++) {
        let v = vertices[i];
        let vx = v.x, vy = v.y;
        if (isGlitch) { vx += (Math.random()-0.5)*15; vy += (Math.random()-0.5)*15; }
        if (i===0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
    }
    ctx.closePath();

    if (isBlueprint) {
        ctx.fillStyle = '#fff';
        for (let i = 0; i < vertices.length; i++) {
            ctx.beginPath(); ctx.arc(vertices[i].x, vertices[i].y, 4, 0, Math.PI*2); ctx.fill();
        }
    } else if (isBlitz && blitzPhase === 'flash' && !result) {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill();
    } else {
        let grad = ctx.createLinearGradient(-100, -100, 100, 100);
        // Farblogik (kurz gehalten)
        if (mode === 'turnier') { grad.addColorStop(0, '#f59e0b'); grad.addColorStop(1, '#ef4444'); }
        else if (settings.cursor === 'magnet') { grad.addColorStop(0, '#fdba74'); grad.addColorStop(1, '#ea580c'); }
        else if (settings.special === 'glitch') { grad.addColorStop(0, '#e879f9'); grad.addColorStop(1, '#9333ea'); }
        else { grad.addColorStop(0, '#3b82f6'); grad.addColorStop(1, '#10b981'); }
        ctx.fillStyle = grad;
        
        if (!isBlueprint) {
            ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        }
    }
    ctx.restore();

    // 7. Cursor Effekte (nur wenn noch kein Ergebnis da ist)
    if (!result) {
        if (settings.cursor === 'magnet') {
            const pulse = (Math.sin(input.magnetPhase) + 1) / 2;
            ctx.beginPath(); ctx.arc(input.deflectedX, input.deflectedY, 4, 0, Math.PI*2); ctx.fillStyle = '#fff'; ctx.fill();
            const alpha = 0.2 + (0.6 * pulse); const size = 12 + (5 * pulse);
            ctx.beginPath(); ctx.strokeStyle = `rgba(249, 115, 22, ${alpha})`; ctx.lineWidth = 2 + (4 * pulse);
            ctx.arc(input.deflectedX, input.deflectedY, size, 0, Math.PI*2); ctx.stroke();
        } else if (settings.cursor === 'mirror') {
            const { deflectedX: mx, deflectedY: my } = input;
            ctx.beginPath(); ctx.moveTo(mx - 10, my); ctx.lineTo(mx + 10, my);
            ctx.moveTo(mx, my - 10); ctx.lineTo(mx, my + 10); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
            ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI*2); ctx.strokeStyle = '#94a3b8'; ctx.stroke();
        }
    }

    // 8. ERGEBNIS MARKER
    if (result) {
        // Linie
        ctx.beginPath(); 
        ctx.moveTo(result.clickX, result.clickY); 
        ctx.lineTo(result.targetX, result.targetY); 
        ctx.strokeStyle = '#fbbf24'; 
        ctx.setLineDash([5, 5]); 
        ctx.stroke(); 
        ctx.setLineDash([]);
        
        // Target Dot (Echter Mittelpunkt)
        ctx.beginPath(); 
        ctx.arc(result.targetX, result.targetY, 4, 0, Math.PI*2); 
        ctx.fillStyle = '#ef4444'; 
        ctx.fill();
        
        // Click Dot (Dein Klick)
        ctx.beginPath(); 
        ctx.arc(result.clickX, result.clickY, 4, 0, Math.PI*2); 
        ctx.fillStyle = (settings.special === 'glitch') ? '#22c55e' : '#d946ef'; 
        ctx.fill();
        
        // Text Label
        const text = result.dist.toFixed(1) + "px";
        let labelY = Math.min(result.clickY, result.targetY) - 45; 
        let labelX = (result.clickX + result.targetX) / 2;
        if (labelY < 30) labelY = Math.max(result.clickY, result.targetY) + 45;
        
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)"; 
        ctx.beginPath(); 
        ctx.roundRect(labelX - 35, labelY - 12, 70, 24, 4); 
        ctx.fill();
        
        ctx.fillStyle = '#fbbf24'; 
        ctx.font = 'bold 12px monospace'; 
        ctx.textAlign = 'center'; 
        ctx.textBaseline = 'middle'; 
        ctx.fillText(text, labelX, labelY);
    }

    if (isSpotlight) ctx.restore();
}