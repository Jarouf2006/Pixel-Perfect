// /game/input.js

export function setupInput(canvas) {
    const inputState = {
        x: 300,
        y: 300,
        deflectedX: 300,
        deflectedY: 300,
        clicked: false
    };

    function updatePosition(evt) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
        const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;

        inputState.x = (clientX - rect.left) * scaleX;
        inputState.y = (clientY - rect.top) * scaleY;
    }

    canvas.addEventListener('mousemove', updatePosition);
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); updatePosition(e); }, { passive: false });

    const triggerClick = (e) => {
        if(e.type === 'touchstart') updatePosition(e);
        inputState.clicked = true;
    };

    canvas.addEventListener('mousedown', triggerClick);
    canvas.addEventListener('touchstart', triggerClick, { passive: false });

    return inputState;
}

export function processInputEffects(inputState, settings, centerPos) {
    inputState.deflectedX = inputState.x;
    inputState.deflectedY = inputState.y;
}

export function resetInputClick(inputState) {
    inputState.clicked = false;
}