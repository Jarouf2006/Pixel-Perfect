document.addEventListener('DOMContentLoaded', () => {
    
    const menuView = document.getElementById('menu-view');
    const guestView = document.getElementById('guest-view');
    
    const btnGuest = document.getElementById('btn-guest');
    const btnBack = document.getElementById('btn-back');
    const btnStart = document.getElementById('btn-start');
    const guestInput = document.getElementById('guest-name');

    function toggleView(showGuest) {
        if (showGuest) {
            menuView.classList.add('hidden');
            guestView.classList.remove('hidden');
            // Fokus für schnelle Eingabe
            setTimeout(() => guestInput.focus(), 100);
        } else {
            guestView.classList.add('hidden');
            menuView.classList.remove('hidden');
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
        const name = guestInput.value;
        
        if (name.trim() === "") {
            // Rahmen rot färben (Original Error Style Logic)
            guestInput.style.borderColor = "#ef4444";
            setTimeout(() => {
                guestInput.style.borderColor = "#334155"; // Zurück zur Original Farbe
            }, 500);
            return;
        }

        localStorage.setItem("pixelPerfectPlayerName", name);
        console.log("Starte Spiel für: " + name);

        // Weiterleitung zur game.html
        window.location.href = "game.html";
    }
});