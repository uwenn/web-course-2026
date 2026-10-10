import { handleCheck, startNewGame } from './js/controller.js';

const inputEl = document.getElementById('guess-input');
const checkBtnEl = document.getElementById('check-btn');
const newGameBtnEl = document.getElementById('new-game-btn');

checkBtnEl.addEventListener('click', handleCheck);

inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        handleCheck();
    }
});

newGameBtnEl.addEventListener('click', startNewGame);

startNewGame();