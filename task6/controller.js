import { CONFIG, state, resetState, moveSnake } from './model.js';
import { updateUI, showOverlay, hideOverlay, draw } from './view.js';

export function startGame() {
  resetState();
  updateUI();
  hideOverlay();
  state.animId = requestAnimationFrame(gameLoop);
}

function endGame() {
  if (state.animId) cancelAnimationFrame(state.animId);

  if (state.win) {
    showOverlay(
      "Победа!",
      `Вы заполнили всю систему файлами!<br>Счёт: <strong>${state.score}</strong>`,
      "Заново",
      "🏆"
    );
  } else {
    showOverlay(
      "Системная ошибка",
      `Произошло столкновение.<br>Собрано файлов: <strong>${state.score}</strong>`,
      "Перезапустить",
      "⚠️"
    );
  }
}

function gameLoop(timestamp) {
  if (!state.gameOver) {
    if (timestamp - state.lastMoveTime >= CONFIG.MOVE_INTERVAL) {
      moveSnake();
      state.lastMoveTime = timestamp;
      updateUI();

      if (state.gameOver) {
        endGame();
        return;
      }
    }
    draw();
    state.animId = requestAnimationFrame(gameLoop);
  }
}

export function bindEvents() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && state.direction.y === 0) state.nextDirection = { x: 0, y: -1 };
    if (e.key === 'ArrowDown' && state.direction.y === 0) state.nextDirection = { x: 0, y: 1 };
    if (e.key === 'ArrowLeft' && state.direction.x === 0) state.nextDirection = { x: -1, y: 0 };
    if (e.key === 'ArrowRight' && state.direction.x === 0) state.nextDirection = { x: 1, y: 0 };
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
    }
  });

  document.getElementById('start-btn').addEventListener('click', startGame);

  setInterval(() => {
    const now = new Date();
    const timeEl = document.getElementById('tray-time');
    const dateEl = document.getElementById('tray-date');
    if (timeEl && dateEl) {
      timeEl.textContent = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      dateEl.textContent = now.toLocaleDateString('ru-RU');
    }
  }, 1000);
}