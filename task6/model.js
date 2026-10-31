export const CONFIG = {
    CELL: 48,
    COLS: 24,
    ROWS: 24,
    MOVE_INTERVAL: 120
};

export const state = {
    snake: [],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    apple: { x: 0, y: 0, type: 0 },
    score: 0,
    best: 0,
    gameOver: true,
    win: false,
    lastMoveTime: 0,
    animId: null
};

export const appTypes = ['word', 'excel', 'pdf', 'folder', 'image'];

export function resetState() {
    state.snake = [
        { x: 12, y: 12 },
        { x: 11, y: 12 },
        { x: 10, y: 12 }
    ];
    state.direction = { x: 1, y: 0 };
    state.nextDirection = { x: 1, y: 0 };
    state.score = 0;
    state.gameOver = false;
    state.win = false;
    state.lastMoveTime = performance.now();
    if (state.animId) cancelAnimationFrame(state.animId);
}

export function spawnApple() {
    let freeCells = [];
    for (let x = 0; x < CONFIG.COLS; x++) {
        for (let y = 0; y < CONFIG.ROWS; y++) {
            if (!state.snake.some(s => s.x === x && s.y === y)) {
                freeCells.push({ x, y });
            }
        }
    }
    if (freeCells.length === 0) return;
    const cell = freeCells[Math.floor(Math.random() * freeCells.length)];
    state.apple = {
        x: cell.x,
        y: cell.y,
        type: appTypes[Math.floor(Math.random() * appTypes.length)]
    };
}

export function moveSnake() {
    state.direction = state.nextDirection;
    const head = state.snake[0];
    const newHead = { x: head.x + state.direction.x, y: head.y + state.direction.y };

    if (newHead.x < 0 || newHead.x >= CONFIG.COLS || newHead.y < 0 || newHead.y >= CONFIG.ROWS) {
        state.gameOver = true;
        return;
    }

    for (let i = 0; i < state.snake.length - 1; i++) {
        if (state.snake[i].x === newHead.x && state.snake[i].y === newHead.y) {
            state.gameOver = true;
            return;
        }
    }

    state.snake.unshift(newHead);

    if (newHead.x === state.apple.x && newHead.y === state.apple.y) {
        state.score++;
        if (state.score > state.best) {
            state.best = state.score;
        }

        if (state.snake.length === CONFIG.COLS * CONFIG.ROWS) {
            state.gameOver = true;
            state.win = true;
            return;
        }

        spawnApple();
    } else {
        state.snake.pop();
    }
}