const input = document.getElementById('guess-input');
const checkBtn = document.getElementById('check-btn');
const newGameBtn = document.getElementById('new-game-btn');
const message = document.getElementById('message');
const attemptsEl = document.getElementById('attempts');
const historyList = document.getElementById('history');

let secret = [];
let attempts = 0;
let history = [];
let gameOver = false;

function generateSecret() {
    const digits = [];
    while (digits.length < 4) {
        const d = String(Math.floor(Math.random() * 10));
        if (!digits.includes(d)) {
            digits.push(d);
        }
    }
    return digits;
}

function validateGuess(value) {
    if (!/^\d{4}$/.test(value)) {
        return { ok: false, error: 'Нужно ровно 4 цифры' };
    }
    const digits = value.split('');
    const unique = new Set(digits);
    if (unique.size !== 4) {
        return { ok: false, error: 'Цифры не должны повторяться' };
    }
    return { ok: true, digits };
}

function countBullsAndCows(guess, secret) {
    let bulls = 0;
    let cows = 0;

    guess.forEach((digit, i) => {
        if (digit === secret[i]) {
            bulls++;
        } else if (secret.includes(digit)) {
            cows++;
        }
    });

    return { bulls, cows };
}

function render() {
    historyList.innerHTML = '';

    const wrap = historyList.parentElement;
    const existingEmpty = wrap.querySelector('.empty-history');

    if (history.length === 0) {
        if (!existingEmpty) {
            const empty = document.createElement('p');
            empty.className = 'empty-history';
            empty.textContent = 'История попыток появится здесь';
            wrap.appendChild(empty);
        }
    } else if (existingEmpty) {
        existingEmpty.remove();
    }

    [...history].reverse().forEach(item => {
        const li = document.createElement('li');

        const guessSpan = document.createElement('span');
        guessSpan.className = 'guess';
        guessSpan.textContent = item.guess;

        const resultSpan = document.createElement('span');
        resultSpan.className = 'result';
        resultSpan.innerHTML = `<span class="bulls">${item.bulls}</span> бык(а), <span class="cows">${item.cows}</span> коров(ы)`;

        li.appendChild(guessSpan);
        li.appendChild(resultSpan);

        historyList.appendChild(li);
    });

    attemptsEl.textContent = attempts;
}

function handleCheck() {
    if (gameOver) return;

    const value = input.value.trim();
    const validation = validateGuess(value);

    if (!validation.ok) {
        message.textContent = validation.error;
        message.className = 'message error';
        return;
    }

    const guess = validation.digits;
    const { bulls, cows } = countBullsAndCows(guess, secret);

    attempts++;
    history.push({ guess: value, bulls, cows });
    input.value = '';
    message.textContent = '';
    message.className = 'message';

    render();

    if (bulls === 4) {
        gameOver = true;
        message.textContent = `Победа! Угадано за ${attempts} попыток`;
        message.className = 'message win';
        input.disabled = true;
        checkBtn.disabled = true;
    }
}

function startNewGame() {
    secret = generateSecret();
    attempts = 0;
    history = [];
    gameOver = false;
    input.disabled = false;
    checkBtn.disabled = false;
    input.value = '';
    message.textContent = '';
    message.className = 'message';
    render();
}

checkBtn.addEventListener('click', handleCheck);

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        handleCheck();
    }
});

newGameBtn.addEventListener('click', startNewGame);

startNewGame();