import {
    CONFIG,
    state,
    resetState,
    getRandomIndex,
    clearTimeouts,
    schedule
} from './model.js';

import {
    pads,
    startBtn,
    showMessage,
    updateLevel,
    updateBest,
    setPadActive,
    clearAllPads,
    enablePads,
    disableStartBtn
} from './view.js';

function showSequence() {
    state.isShowing = true;
    state.isWaiting = false;
    state.playerIndex = 0;

    let i = 0;

    function next() {
        if (i >= state.sequence.length) {
            state.isShowing = false;
            state.isWaiting = true;
            return;
        }

        const index = state.sequence[i];
        setPadActive(index, true);

        schedule(() => {
            setPadActive(index, false);
            i++;
            schedule(next, CONFIG.BETWEEN_DELAY);
        }, CONFIG.ACTIVE_DURATION);
    }

    schedule(next, CONFIG.SHOW_DELAY);
}

function handlePadClick(e) {
    if (!state.isWaiting || state.isShowing || state.isGameOver) return;

    const pad = e.currentTarget;
    const index = Number(pad.dataset.index);

    setPadActive(index, true);
    schedule(() => setPadActive(index, false), CONFIG.ACTIVE_DURATION);

    if (index === state.sequence[state.playerIndex]) {
        state.playerIndex++;

        if (state.playerIndex === state.sequence.length) {
            state.isWaiting = false;
            state.level++;
            updateLevel(state.level);

            if (state.level > state.best) {
                state.best = state.level;
                updateBest(state.best);
            }

            showMessage('ВЕРНО! СЛЕДУЮЩИЙ...');

            schedule(nextRound, CONFIG.ROUND_DELAY);
        }
    } else {
        endGame();
    }
}

function nextRound() {
    state.sequence.push(getRandomIndex());
    showSequence();
}

function endGame() {
    state.isGameOver = true;
    state.isWaiting = false;
    state.isShowing = false;
    clearTimeouts();

    clearAllPads();
    enablePads(false);

    showMessage(`ПРОВАЛ. УРОВЕНЬ ${state.level}`, 'error');

    disableStartBtn(false, 'ЗАНОВО');
}

export function startGame() {
    clearTimeouts();

    resetState();

    updateLevel(state.level);
    showMessage('СМОТРИ И ЗАПОМИНАЙ...');

    clearAllPads();
    enablePads(true);
    disableStartBtn(true, 'ИГРА...');

    state.sequence.push(getRandomIndex());
    showSequence();
}

export function bindEvents() {
    pads.forEach(pad => {
        pad.addEventListener('click', handlePadClick);
    });

    startBtn.addEventListener('click', startGame);
}