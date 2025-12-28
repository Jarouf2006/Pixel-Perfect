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
    
    // Shrink mode: Apply shrink scale
    if (settings.special === 'shrink') {
        const shrinkScale = gameState.shrinkScale || 1;
        ctx.scale(shrinkScale, shrinkScale);
    }
    
    // Glitch-Effekt nur wenn nicht geklickt wurde (kein result und nicht frozen)
    const glitchActive = isGlitch && !result && !gameState.frozen;
    
    if (glitchActive) {
        ctx.translate((Math.random()-0.5)*10, (Math.random()-0.5)*10);
    }
    
    ctx.rotate(rotation);
    
    // Decay mode: Handle vertices with warning animation
    const isDecay = settings.special === 'decay';
    const decayVertices = gameState.decayVertices || vertices.map(() => true);
    const decayWarning = gameState.decayWarning !== undefined ? gameState.decayWarning : -1;
    const decayWarningTime = gameState.decayWarningTime || 0;
    
    // Build visible vertices array, applying shake to warning vertex
    let visibleVerts = [];
    if (isDecay) {
        for (let i = 0; i < vertices.length; i++) {
            if (decayVertices[i]) {
                let v = { ...vertices[i] };
                // Apply shake to warning vertex
                if (i === decayWarning && !result && !gameState.frozen) {
                    const shakeIntensity = 3 + (decayWarningTime / 45) * 8; // Increases over time
                    const shakeSpeed = 0.5 + (decayWarningTime / 45) * 0.5;
                    v.x += Math.sin(decayWarningTime * shakeSpeed) * shakeIntensity;
                    v.y += Math.cos(decayWarningTime * shakeSpeed * 1.3) * shakeIntensity;
                }
                visibleVerts.push({ vertex: v, originalIndex: i });
            }
        }
    } else {
        visibleVerts = vertices.map((v, i) => ({ vertex: v, originalIndex: i }));
    }
    
    ctx.beginPath();
    
    for (let i = 0; i < visibleVerts.length; i++) {
        let v = visibleVerts[i].vertex;
        let vx = v.x, vy = v.y;
        if (glitchActive) { vx += (Math.random()-0.5)*15; vy += (Math.random()-0.5)*15; }
        if (i===0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
    }
    ctx.closePath();

    if (isBlueprint) {
        // Blueprint: Nur Eckpunkte, keine Füllung
        ctx.fillStyle = '#fff';
        for (let i = 0; i < visibleVerts.length; i++) {
            ctx.beginPath(); ctx.arc(visibleVerts[i].vertex.x, visibleVerts[i].vertex.y, 4, 0, Math.PI*2); ctx.fill();
        }
    } else if (isBlitz && blitzPhase === 'flash' && !result) {
        // Blitz Flash: Weiße Umrisse
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill();
    } else {
        // Farben basierend auf Modus (passend zu Header-Farben)
        let grad = ctx.createLinearGradient(-100, -100, 100, 100);
        
        if (mode === 'normal') {
            // Normal: Blau -> Grün
            grad.addColorStop(0, '#60a5fa');
            grad.addColorStop(1, '#34d399');
        }
        else if (mode === 'blitz' || settings.visibility === 'blitz') {
            // Blitz: Gelb/Gold
            if (blitzExtreme) {
                // Extreme: Rot
                grad.addColorStop(0, '#ef4444');
                grad.addColorStop(1, '#f87171');
            } else {
                // Normal Blitz: Gelb
                grad.addColorStop(0, '#f59e0b');
                grad.addColorStop(1, '#fbbf24');
            }
        }
        else if (mode === 'turnier') {
            // Turnier: Rot -> Orange
            grad.addColorStop(0, '#ef4444');
            grad.addColorStop(1, '#f59e0b');
        }
        else if (mode === 'hunter' || settings.movement === 'hunter') {
            // Hunter: Cyan
            grad.addColorStop(0, '#06b6d4');
            grad.addColorStop(1, '#22d3ee');
        }
        else if (mode === 'pulsar' || settings.special === 'pulsar') {
            // Pulsar: Pink/Magenta
            grad.addColorStop(0, '#d946ef');
            grad.addColorStop(1, '#e879f9');
        }
        else if (mode === 'spotlight' || settings.style === 'spotlight') {
            // Spotlight: Grau/Slate
            grad.addColorStop(0, '#64748b');
            grad.addColorStop(1, '#94a3b8');
        }
        else if (mode === 'shrink' || settings.special === 'shrink') {
            // Shrink: Pink/Rose
            grad.addColorStop(0, '#ec4899');
            grad.addColorStop(1, '#f472b6');
        }
        else if (mode === 'glitch' || settings.special === 'glitch') {
            // Glitch: Lila
            grad.addColorStop(0, '#a855f7');
            grad.addColorStop(1, '#c084fc');
        }
        else if (mode === 'mirage' || settings.special === 'mirage') {
            // Mirage: Teal
            grad.addColorStop(0, '#14b8a6');
            grad.addColorStop(1, '#2dd4bf');
        }
        else if (mode === 'decay' || settings.special === 'decay') {
            // Decay: Lime/Green
            grad.addColorStop(0, '#84cc16');
            grad.addColorStop(1, '#a3e635');
        }
        else if (mode === 'custom') {
            // Custom: Violett
            grad.addColorStop(0, '#8b5cf6');
            grad.addColorStop(1, '#a78bfa');
        }
        else if (mode === 'tower') {
            // Tower: Verwendet die Farbe basierend auf Floor
            const towerColor = gameState.towerColor || '#3b82f6';
            // Hellere Version für Gradient
            grad.addColorStop(0, towerColor);
            grad.addColorStop(1, lightenColor(towerColor, 30));
        }
        else {
            // Default: Blau -> Grün
            grad.addColorStop(0, '#3b82f6');
            grad.addColorStop(1, '#10b981');
        }
        
        ctx.fillStyle = grad;
        
        if (!isBlueprint) {
            ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
        }
    }
    ctx.restore();

    // 6b. Decay: Draw falling pieces
    if (isDecay && gameState.decayFallingPieces && gameState.decayFallingPieces.length > 0) {
        gameState.decayFallingPieces.forEach(piece => {
            ctx.save();
            ctx.translate(piece.x, piece.y);
            ctx.rotate(piece.rotation);
            ctx.globalAlpha = piece.opacity;
            
            ctx.beginPath();
            piece.vertices.forEach((v, i) => {
                if (i === 0) ctx.moveTo(v.x, v.y);
                else ctx.lineTo(v.x, v.y);
            });
            ctx.closePath();
            
            // Decay color gradient
            const grad = ctx.createLinearGradient(-10, -10, 10, 10);
            grad.addColorStop(0, '#84cc16');
            grad.addColorStop(1, '#a3e635');
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,' + piece.opacity + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.globalAlpha = 1;
            ctx.restore();
        });
    }

    // 7. ERGEBNIS MARKER
    if (result) {
        // Bestimme Formfarbe für Kontrast
        let shapeColor = '#3b82f6'; // Default
        if (mode === 'tower') shapeColor = gameState.towerColor || '#3b82f6';
        else if (mode === 'turnier') shapeColor = '#ef4444';
        else if (mode === 'hunter' || settings.movement === 'hunter') shapeColor = '#06b6d4';
        else if (mode === 'pulsar' || settings.special === 'pulsar') shapeColor = '#d946ef';
        else if (mode === 'shrink' || settings.special === 'shrink') shapeColor = '#ec4899';
        else if (mode === 'glitch' || settings.special === 'glitch') shapeColor = '#a855f7';
        else if (mode === 'mirage' || settings.special === 'mirage') shapeColor = '#14b8a6';
        else if (mode === 'decay' || settings.special === 'decay') shapeColor = '#84cc16';
        else if (mode === 'spotlight' || settings.style === 'spotlight') shapeColor = '#64748b';
        
        // Kontrastfarbe für Click-Punkt (Grün wenn Form rötlich/lila, sonst Magenta)
        const clickDotColor = getContrastDotColor(shapeColor);
        // Target-Punkt ist immer Rot
        const targetDotColor = '#ef4444';
        
        // Outline-Farbe basierend auf Helligkeit
        const clickOutline = isColorDark(clickDotColor) ? '#ffffff' : '#000000';
        const targetOutline = isColorDark(targetDotColor) ? '#ffffff' : '#000000';
        
        // Linie
        ctx.beginPath(); 
        ctx.moveTo(result.clickX, result.clickY); 
        ctx.lineTo(result.targetX, result.targetY); 
        ctx.strokeStyle = '#fbbf24'; 
        ctx.setLineDash([5, 5]); 
        ctx.lineWidth = 2;
        ctx.stroke(); 
        ctx.setLineDash([]);
        
        // Target Dot (Echter Mittelpunkt) - mit Outline
        ctx.beginPath(); 
        ctx.arc(result.targetX, result.targetY, 4.5, 0, Math.PI*2); 
        ctx.fillStyle = targetDotColor;
        ctx.fill();
        ctx.strokeStyle = targetOutline;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
        // Click Dot (Dein Klick) - mit Outline
        ctx.beginPath(); 
        ctx.arc(result.clickX, result.clickY, 4.5, 0, Math.PI*2); 
        ctx.fillStyle = clickDotColor;
        ctx.fill();
        ctx.strokeStyle = clickOutline;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        
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

// Helper: Hex-Farbe aufhellen
function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

// Helper: Prüfen ob Farbe dunkel ist
function isColorDark(hex) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    // Luminanz-Formel
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
}

// Helper: Kontrastfarbe für Click-Punkt basierend auf Formfarbe
function getContrastDotColor(shapeColor) {
    const num = parseInt(shapeColor.replace('#', ''), 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    
    // Wenn Form rötlich/lila/orange ist -> Grün für Kontrast
    // Wenn Form grünlich/cyan ist -> Magenta für Kontrast
    // Wenn Form bläulich ist -> Grün für Kontrast
    
    const isReddish = r > 150 && r > g;
    const isPurplish = r > 100 && b > 100 && g < 150;
    const isOrangish = r > 200 && g > 100 && g < 200 && b < 100;
    const isGreenish = g > r && g > b;
    const isCyanish = g > 150 && b > 150 && r < 150;
    
    if (isReddish || isPurplish || isOrangish) {
        return '#22c55e'; // Grün
    } else if (isGreenish || isCyanish) {
        return '#d946ef'; // Magenta
    } else {
        return '#22c55e'; // Default: Grün (gut sichtbar auf blau)
    }
}