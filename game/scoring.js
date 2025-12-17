// /game/scoring.js

export function getCentroid(vertices) {
    let a = 0, cx = 0, cy = 0;
    for (let i = 0; i < vertices.length; i++) {
        const j = (i + 1) % vertices.length;
        const c = vertices[i].x * vertices[j].y - vertices[j].x * vertices[i].y;
        a += c;
        cx += (vertices[i].x + vertices[j].x) * c;
        cy += (vertices[i].y + vertices[j].y) * c;
    }
    a /= 2;
    if(a === 0) return {x:0, y:0};
    return { x: cx / (6 * a), y: cy / (6 * a) };
}

export function calculateScore(dist, settings, mode, blitzExtreme) {
    let points = 0;
    let tol = (settings.size === 'small') ? 60 : 120;
    
    // Prüfen, ob schwieriger Modus
    const isHardMode = mode === 'turnier' || settings.visibility === 'blitz' || settings.special === 'glitch';

    if (dist <= 900) {
        if (isHardMode) {
            points = Math.floor(1000 * Math.exp(-0.15 * dist));
        } else if (dist < tol) {
            points = Math.floor(1000 * Math.pow(1 - (dist/tol), 3));
        }
        if (dist < 3) points = 1000;
        if (points < 0) points = 0;
    }
    return points;
}