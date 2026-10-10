import {
    state,
    resetState,
    validateGuess,
    countBullsAndCows
} from './model.js';

import {
    render,
    showMessage,
    clearInput,
    getInputValue,
    blockInput
} from './view.js';

export function handleCheck() {
    if (state.gameOver) return;

    const value = getInputValue();
    const validation = validateGuess(value);

    if (!validation.ok) {
        showMessage(validation.error, 'error');
        return;
    }

    const guess = validation.digits;
    const { bulls, cows } = countBullsAndCows(guess, state.secret);

    state.attempts++;
    state.history.push({ guess: value, bulls, cows });
    clearInput();
    showMessage('');

    render(state);

    if (bulls === 4) {
        state.gameOver = true;
        showMessage(`Победа! Угадано за ${state.attempts} попыток`, 'win');
        blockInput(true);
    }
}

export function startNewGame() {
    resetState();
    blockInput(false);
    clearInput();
    showMessage('');
    render(state);
}