const message = document.getElementById('message');
const attemptsEl = document.getElementById('attempts');
const historyList = document.getElementById('history');
const input = document.getElementById('guess-input');
const checkBtn = document.getElementById('check-btn');

export function render(state) {
    historyList.innerHTML = '';

    const wrap = historyList.parentElement;
    const existingEmpty = wrap.querySelector('.empty-history');

    if (state.history.length === 0) {
        if (!existingEmpty) {
            const empty = document.createElement('p');
            empty.className = 'empty-history';
            empty.textContent = 'История попыток появится здесь';
            wrap.appendChild(empty);
        }
    } else if (existingEmpty) {
        existingEmpty.remove();
    }

    [...state.history].reverse().forEach(item => {
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

    attemptsEl.textContent = state.attempts;
}

export function showMessage(text, type = '') {
    message.textContent = text;
    message.className = 'message' + (type ? ' ' + type : '');
}

export function clearInput() {
    input.value = '';
}

export function getInputValue() {
    return input.value.trim();
}

export function blockInput(disabled) {
    input.disabled = disabled;
    checkBtn.disabled = disabled;
}