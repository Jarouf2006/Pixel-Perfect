// /net/api.js
const SAVE_KEY = 'pixel_perfect_save';
const HANDOVER_KEY = 'pixelPerfectPlayerName'; // Das ist der Key aus deiner Login-Seite

export function loadUser() {
    // 1. Zuerst: Haben wir schon eine laufende Spiel-Session?
    const saved = sessionStorage.getItem(SAVE_KEY);
    if (saved) {
        try { return JSON.parse(saved); } catch(e) { console.error(e); }
    }

    // 2. FALLBACK: Kommen wir gerade frisch von der Login-Seite?
    // Wir prüfen den localStorage nach dem Namen, den script.js gespeichert hat.
    const handoverName = localStorage.getItem(HANDOVER_KEY);
    
    if (handoverName) {
        console.log("Login gefunden für:", handoverName);
        
        // Neuen User erstellen
        const newUser = createDefaultUser(handoverName);
        
        // Sofort in die Session speichern (damit wir eingeloggt sind)
        saveUser(newUser);
        
        // WICHTIG: Den Handover-Namen löschen, damit wir beim Neuladen (F5)
        // nicht den Spielstand mit einem leeren Level 1 Profil überschreiben.
        localStorage.removeItem(HANDOVER_KEY);
        
        return newUser;
    }

    // Kein User gefunden -> Intro Overlay wird angezeigt
    return null;
}

export function saveUser(user) {
    sessionStorage.setItem(SAVE_KEY, JSON.stringify(user));
}

export function deleteUser() {
    sessionStorage.removeItem(SAVE_KEY);
    // Zur Sicherheit auch den Handover Key löschen, falls er noch da ist
    localStorage.removeItem(HANDOVER_KEY);
}

export function createDefaultUser(name) {
    return { name: name, xp: 0, level: 1, towerMax: 1 };
}