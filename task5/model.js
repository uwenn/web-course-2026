export const CONFIG = {
    SHOW_DELAY: 550,
    ACTIVE_DURATION: 400,
    BETWEEN_DELAY: 180,
    ROUND_DELAY: 900
};

export const state = {
    sequence: [],
    playerIndex: 0,
    level: 0,
    best: 0,
    isShowing: false,
    isWaiting: false,
    isGameOver: true,
    timeouts: []
};

export function resetState() {
    state.sequence = [];
    state.playerIndex = 0;
    state.level = 0;
    state.isShowing = false;
    state.isWaiting = false;
    state.isGameOver = false;
}

export function getRandomIndex() {
    return Math.floor(Math.random() * 4);
}

export function clearTimeouts() {
    state.timeouts.forEach(id => clearTimeout(id));
    state.timeouts = [];
}

export function schedule(fn, delay) {
    const id = setTimeout(fn, delay);
    state.timeouts.push(id);
    return id;
}