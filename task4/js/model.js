export const state = {
    secret: [],
    attempts: 0,
    history: [],
    gameOver: false
};

export function generateSecret() {
    const digits = [];
    while (digits.length < 4) {
        const d = String(Math.floor(Math.random() * 10));
        if (!digits.includes(d)) {
            digits.push(d);
        }
    }
    return digits;
}

export function validateGuess(value) {
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

export function countBullsAndCows(guess, secret) {
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

export function resetState() {
    state.secret = generateSecret();
    state.attempts = 0;
    state.history = [];
    state.gameOver = false;
}