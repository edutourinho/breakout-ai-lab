import {
  FIXED_STEP,
  MAX_FRAME_TIME,
  clearInput,
  createInitialState,
  launchBall,
  pauseGame,
  restartGame,
  resumeGame,
  setLeftPressed,
  startGame,
  setRightPressed,
  step
} from './game.js';
import { render } from './render.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const livesEl = document.querySelector('#lives');
const statusEl = document.querySelector('#status');
const hintEl = document.querySelector('#hint');
const pauseBtn = document.querySelector('#pause');
const resumeBtn = document.querySelector('#resume');
const restartBtn = document.querySelector('#restart');
const overlay = document.querySelector('#overlay');
const overlayKicker = document.querySelector('#overlay-kicker');
const overlayTitle = document.querySelector('#overlay-title');
const overlayText = document.querySelector('#overlay-text');
const overlayAction = document.querySelector('#overlay-action');

const state = createInitialState();
const keys = new Set();
const touch = { left: false, right: false };
const activePointers = { left: new Set(), right: new Set() };
const statusLabels = {
  ready: 'Pronto',
  playing: 'Em jogo',
  paused: 'Pausado',
  won: 'Vitória',
  gameover: 'Fim de jogo'
};

let accumulator = 0;
let lastTime = performance.now();

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  render(ctx, state);
}

function applyInput() {
  setLeftPressed(state, keys.has('ArrowLeft') || keys.has('KeyA') || touch.left);
  setRightPressed(state, keys.has('ArrowRight') || keys.has('KeyD') || touch.right);
}

function releaseAllInput() {
  keys.clear();
  touch.left = false;
  touch.right = false;
  activePointers.left.clear();
  activePointers.right.clear();
  clearInput(state);
}

function updateOverlay() {
  const visible = state.status !== 'playing';
  overlay.hidden = !visible;
  if (!visible) return;

  let content;
  if (state.status === 'ready') {
    content = {
      kicker: 'Pronto para jogar?',
      title: 'Breakout',
      text: 'Mova a raquete com ←/→ ou A/D. Use Espaço para lançar a bola e pausar.',
      action: 'Começar jogo'
    };
  } else if (state.status === 'paused') {
    content = {
      kicker: 'Pausa',
      title: 'Jogo pausado',
      text: 'Respire fundo. A partida continua exatamente de onde parou.',
      action: 'Retomar jogo'
    };
  } else if (state.status === 'won') {
    content = {
      kicker: 'Parabéns!',
      title: 'Você venceu!',
      text: `Todos os tijolos foram destruídos. Pontuação final: ${state.score}.`,
      action: 'Jogar novamente'
    };
  } else {
    content = {
      kicker: 'Fim de partida',
      title: 'Fim de jogo',
      text: `Você ficou sem vidas. Pontuação final: ${state.score}.`,
      action: 'Jogar novamente'
    };
  }

  overlayKicker.textContent = content.kicker;
  overlayTitle.textContent = content.title;
  overlayText.textContent = content.text;
  overlayAction.textContent = content.action;
}

function syncUI() {
  scoreEl.textContent = String(state.score);
  livesEl.textContent = String(state.lives);
  statusEl.textContent = statusLabels[state.status];
  pauseBtn.disabled = state.status !== 'playing';
  resumeBtn.disabled = state.status !== 'paused';

  if (state.status === 'ready') {
    hintEl.textContent = 'Use ←/→ ou A/D para mover. Espaço inicia a partida.';
  } else if (state.status === 'paused') {
    hintEl.textContent = 'O jogo está pausado.';
  } else if (state.status === 'won' || state.status === 'gameover') {
    hintEl.textContent = 'Use “Jogar novamente” para recomeçar.';
  } else if (state.ball.stuck) {
    hintEl.textContent = 'Pressione Espaço para lançar a bola.';
  } else {
    hintEl.textContent = 'Espaço pausa o jogo.';
  }

  updateOverlay();
  if (overlay.hidden) {
    if (document.activeElement === overlayAction) canvas.focus({ preventScroll: true });
  } else {
    overlayAction.focus({ preventScroll: true });
  }
}

function performAction() {
  if (state.status === 'ready') {
    startGame(state);
  } else if (state.status === 'playing') {
    if (!launchBall(state)) pauseGame(state);
  } else if (state.status === 'paused') {
    resumeGame(state);
  } else {
    releaseAllInput();
    restartGame(state);
  }
  syncUI();
}

function bindHoldButton(button, side) {
  const active = activePointers[side];
  button.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    active.add(event.pointerId);
    button.setPointerCapture(event.pointerId);
    touch[side] = true;
    applyInput();
  });
  const release = (event) => {
    active.delete(event.pointerId);
    touch[side] = active.size > 0;
    applyInput();
  };
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
  button.addEventListener('contextmenu', (event) => event.preventDefault());
}

function handleBlur() {
  releaseAllInput();
  if (pauseGame(state)) syncUI();
  accumulator = 0;
  lastTime = performance.now();
}

function frame(time) {
  const delta = Math.min(Math.max((time - lastTime) / 1000, 0), MAX_FRAME_TIME);
  lastTime = time;

  if (state.status === 'playing') {
    accumulator += delta;
    let needsUIUpdate = false;
    while (accumulator >= FIXED_STEP) {
      const events = step(state, FIXED_STEP);
      accumulator -= FIXED_STEP;
      if (events.some((event) => event !== 'wall' && event !== 'paddle')) {
        needsUIUpdate = true;
      }
      if (state.status !== 'playing' || state.ball.stuck) {
        accumulator = 0;
        break;
      }
    }
    if (needsUIUpdate) syncUI();
  } else {
    accumulator = 0;
  }

  render(ctx, state);
  requestAnimationFrame(frame);
}

const controlKeys = new Set(['ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD', 'Space']);

window.addEventListener('keydown', (event) => {
  if (!controlKeys.has(event.code)) return;
  event.preventDefault();
  if (event.code === 'Space') {
    if (!event.repeat) performAction();
    return;
  }
  keys.add(event.code);
  applyInput();
});

window.addEventListener('keyup', (event) => {
  if (!controlKeys.has(event.code)) return;
  event.preventDefault();
  keys.delete(event.code);
  applyInput();
});

window.addEventListener('blur', handleBlur);
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) handleBlur();
});

if ('ResizeObserver' in window) {
  new ResizeObserver(resizeCanvas).observe(document.querySelector('#stage'));
}

overlayAction.addEventListener('click', performAction);
pauseBtn.addEventListener('click', () => {
  if (pauseGame(state)) syncUI();
});
resumeBtn.addEventListener('click', () => {
  if (resumeGame(state)) syncUI();
});
restartBtn.addEventListener('click', () => {
  releaseAllInput();
  restartGame(state);
  syncUI();
});

bindHoldButton(document.querySelector('#touch-left'), 'left');
bindHoldButton(document.querySelector('#touch-right'), 'right');

resizeCanvas();
syncUI();
requestAnimationFrame(frame);
