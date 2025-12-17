document.addEventListener('DOMContentLoaded', () => {
    
    const menuView = document.getElementById('menu-view');
    const authOverlay = document.getElementById('authOverlay');
    
    const btnGuest = document.getElementById('btn-guest');
    const btnBack = document.getElementById('btn-back');
    const btnStart = document.getElementById('btn-start');
    const guestInput = document.getElementById('guest-name');

    function toggleView(showAuth) {
        if (showAuth) {
            authOverlay.classList.remove('hidden');
            // Fokus für schnelle Eingabe
            setTimeout(() => guestInput.focus(), 100);
        } else {
            authOverlay.classList.add('hidden');
        }
    }

    btnGuest.addEventListener('click', () => {
        toggleView(true);
    });

    btnBack.addEventListener('click', () => {
        toggleView(false);
    });

    btnStart.addEventListener('click', () => {
        startGame();
    });

    guestInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startGame();
        }
    });

    function startGame() {
        const name = guestInput.value.trim();
        
        if (name === "") {
            // Rahmen rot färben
            guestInput.style.borderColor = "#ef4444";
            setTimeout(() => {
                guestInput.style.borderColor = "#334155";
            }, 500);
            return;
        }

        localStorage.setItem("pixelPerfectPlayerName", name);
        console.log("Starte Spiel für: " + name);

        // Weiterleitung zur game.html
        window.location.href = "game.html";
    }
});