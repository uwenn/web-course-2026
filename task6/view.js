import { CONFIG, state } from './model.js';

export const canvas = document.getElementById('game');
export const ctx = canvas.getContext('2d');
export const scoreEl = document.getElementById('score');
export const bestEl = document.getElementById('best');
export const overlay = document.getElementById('overlay');
export const dialogTitle = document.getElementById('dialog-title');
export const dialogText = document.getElementById('dialog-text');
export const dialogIcon = document.getElementById('dialog-icon');
export const startBtn = document.getElementById('start-btn');

export function updateUI() {
  scoreEl.textContent = state.score;
  bestEl.textContent = state.best;
}

export function showOverlay(title, text, buttonText, icon = "ℹ️") {
  overlay.classList.remove('hidden');
  dialogIcon.textContent = icon;
  dialogTitle.textContent = title;
  dialogText.innerHTML = text;
  startBtn.textContent = buttonText;
}

export function hideOverlay() {
  overlay.classList.add('hidden');
}

export function draw() {
  ctx.fillStyle = '#18191c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#25262b';
  ctx.lineWidth = 2;

  for (let i = 1; i < CONFIG.COLS; i++) {
    ctx.beginPath();
    ctx.moveTo(i * CONFIG.CELL + 0.5, 0);
    ctx.lineTo(i * CONFIG.CELL + 0.5, canvas.height);
    ctx.stroke();
  }
  for (let i = 1; i < CONFIG.ROWS; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * CONFIG.CELL + 0.5);
    ctx.lineTo(canvas.width, i * CONFIG.CELL + 0.5);
    ctx.stroke();
  }

  drawApple();
  drawSnake();
}

function drawApple() {
  const { x, y, type } = state.apple;
  const px = x * CONFIG.CELL;
  const py = y * CONFIG.CELL;
  const cx = px + CONFIG.CELL / 2;
  const cy = py + CONFIG.CELL / 2;
  const pad = 6;

  ctx.shadowColor = 'rgba(255, 255, 255, 0.2)';
  ctx.shadowBlur = 20;

  if (type === 'word') {
    ctx.fillStyle = '#2b579a';
    ctx.fillRect(px + pad, py + pad, CONFIG.CELL - pad * 2, CONFIG.CELL - pad * 2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('W', cx, cy);
  } else if (type === 'excel') {
    ctx.fillStyle = '#217346';
    ctx.fillRect(px + pad, py + pad, CONFIG.CELL - pad * 2, CONFIG.CELL - pad * 2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('X', cx, cy);
  } else if (type === 'pdf') {
    ctx.fillStyle = '#d93025';
    ctx.fillRect(px + pad, py + pad, CONFIG.CELL - pad * 2, CONFIG.CELL - pad * 2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px "Segoe UI"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PDF', cx, cy);
  } else if (type === 'image') {
    ctx.fillStyle = '#f9a825';
    ctx.fillRect(px + pad, py + pad, CONFIG.CELL - pad * 2, CONFIG.CELL - pad * 2);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy - 6, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(px + pad, py + CONFIG.CELL - pad);
    ctx.lineTo(cx, cy + 4);
    ctx.lineTo(px + CONFIG.CELL - pad, py + CONFIG.CELL - pad);
    ctx.fill();
  } else {
    ctx.fillStyle = '#fbc02d';
    ctx.fillRect(px + pad, py + pad + 8, CONFIG.CELL - pad * 2, CONFIG.CELL - pad * 2 - 8);
    ctx.fillStyle = '#f9a825';
    ctx.fillRect(px + pad, py + pad, 20, 10);
  }

  ctx.shadowBlur = 0;
}

function drawSnake() {
  state.snake.forEach((segment, i) => {
    const isHead = i === 0;
    const px = segment.x * CONFIG.CELL;
    const py = segment.y * CONFIG.CELL;
    const cx = px + CONFIG.CELL / 2;
    const cy = py + CONFIG.CELL / 2;

    if (isHead) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 20);
      ctx.lineTo(cx - 8, cy + 14);
      ctx.lineTo(cx + 4, cy + 4);
      ctx.lineTo(cx + 16, cy + 18);
      ctx.lineTo(cx + 20, cy + 14);
      ctx.lineTo(cx + 12, cy);
      ctx.lineTo(cx + 24, cy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = '#e8e8e8';
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.roundRect(px + 6, py + 6, CONFIG.CELL - 12, CONFIG.CELL - 12, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0078d7';
      ctx.beginPath();
      ctx.roundRect(px + 8, py + 8, CONFIG.CELL - 16, 12, 4);
      ctx.fill();
    }
  });
}