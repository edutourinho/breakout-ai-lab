import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BRICK_POINTS,
  HEIGHT,
  MAX_FRAME_TIME,
  START_LIVES,
  WIDTH,
  clearInput,
  createInitialState,
  launchBall,
  pauseGame,
  restartGame,
  resumeGame,
  setLeftPressed,
  setRightPressed,
  startGame,
  step,
  togglePause
} from '../src/game.js';

function playingState() {
  const state = createInitialState();
  startGame(state);
  launchBall(state);
  return state;
}

test('estado inicial contém três vidas, raquete central e todos os tijolos', () => {
  const state = createInitialState();
  assert.equal(state.status, 'ready');
  assert.equal(state.score, 0);
  assert.equal(state.lives, START_LIVES);
  assert.equal(state.bricks.length, 40);
  assert.equal(state.bricks.every((brick) => brick.alive), true);
  assert.equal(state.ball.stuck, true);
  assert.equal(state.paddle.x, (WIDTH - state.paddle.width) / 2);
});

test('iniciar e lançar a bola preparada na raquete', () => {
  const state = createInitialState();
  assert.equal(launchBall(state), false);
  assert.equal(startGame(state), true);
  assert.equal(startGame(state), false);
  assert.equal(state.status, 'playing');
  assert.equal(launchBall(state), true);
  assert.equal(state.ball.stuck, false);
  assert.ok(state.ball.vy < 0);
  assert.ok(Math.hypot(state.ball.vx, state.ball.vy) > 0);
  assert.equal(launchBall(state), false);
});

test('paredes laterais e superior refletem a bola sem custar vidas', () => {
  const state = playingState();

  state.ball.x = 2;
  state.ball.y = 200;
  state.ball.vx = -200;
  state.ball.vy = -100;
  let events = step(state, 1 / 120);
  assert.ok(events.includes('wall'));
  assert.equal(state.ball.x, state.ball.radius);
  assert.ok(state.ball.vx > 0);

  state.ball.x = WIDTH - 2;
  state.ball.y = 200;
  state.ball.vx = 200;
  state.ball.vy = 100;
  events = step(state, 1 / 120);
  assert.ok(events.includes('wall'));
  assert.equal(state.ball.x, WIDTH - state.ball.radius);
  assert.ok(state.ball.vx < 0);

  state.ball.x = 180;
  state.ball.y = 2;
  state.ball.vx = 80;
  state.ball.vy = -240;
  events = step(state, 1 / 120);
  assert.ok(events.includes('wall'));
  assert.equal(state.ball.y, state.ball.radius);
  assert.ok(state.ball.vy > 0);
  assert.equal(state.lives, START_LIVES);
});

test('subpassos impedem que a bola atravesse a parede em quadros longos', () => {
  const state = playingState();
  state.ball.x = 300;
  state.ball.y = 300;
  state.ball.vx = 1200;
  state.ball.vy = 0;

  const events = step(state, MAX_FRAME_TIME);

  assert.ok(events.includes('wall'));
  assert.ok(state.ball.x > 0 && state.ball.x < WIDTH);
  assert.ok(state.ball.vx < 0);
});

test('a raquete devolve a bola para cima sem alterar pontos ou vidas', () => {
  const state = playingState();
  const { paddle } = state;
  state.ball.x = paddle.x + paddle.width / 2;
  state.ball.y = paddle.y - state.ball.radius - 1;
  state.ball.vx = 0;
  state.ball.vy = 220;

  const events = step(state, 1 / 60);

  assert.ok(events.includes('paddle'));
  assert.ok(state.ball.vy < 0);
  assert.equal(state.score, 0);
  assert.equal(state.lives, START_LIVES);

  const edge = playingState();
  edge.ball.x = edge.paddle.x + edge.paddle.width - 4;
  edge.ball.y = edge.paddle.y - edge.ball.radius - 1;
  edge.ball.vx = 0;
  edge.ball.vy = 220;
  step(edge, 1 / 60);
  assert.ok(edge.ball.vx > 0);
});

test('tijolo é destruído, pontua e reflete a bola', () => {
  const state = playingState();
  const brick = state.bricks.find((item) => item.row === 4 && item.col === 3);
  state.ball.x = brick.x + brick.width / 2;
  state.ball.y = brick.y + brick.height + state.ball.radius + 1;
  state.ball.vx = 0;
  state.ball.vy = -220;

  const events = step(state, 1 / 60);

  assert.ok(events.includes('brick'));
  assert.equal(brick.alive, false);
  assert.equal(state.score, BRICK_POINTS);
  assert.ok(state.ball.vy > 0);
  assert.equal(state.status, 'playing');
});

test('a pontuação acumula a cada tijolo destruído', () => {
  const state = playingState();
  const targets = state.bricks.filter((brick) => brick.row === 4).slice(0, 2);

  for (const brick of targets) {
    state.ball.x = brick.x + brick.width / 2;
    state.ball.y = brick.y + brick.height + state.ball.radius + 1;
    state.ball.vx = 0;
    state.ball.vy = -240;
    step(state, 1 / 60);
  }

  assert.equal(state.score, BRICK_POINTS * 2);
  assert.equal(targets.every((brick) => !brick.alive), true);
});

test('bola perdida custa uma vida e volta presa à raquete', () => {
  const state = playingState();
  state.ball.x = 180;
  state.ball.y = HEIGHT + state.ball.radius + 1;
  state.ball.vx = 0;
  state.ball.vy = 100;

  const events = step(state, 1 / 120);

  assert.ok(events.includes('lifeLost'));
  assert.equal(state.lives, START_LIVES - 1);
  assert.equal(state.status, 'playing');
  assert.equal(state.ball.stuck, true);
  assert.equal(state.ball.vx, 0);
  assert.equal(state.ball.y, state.paddle.y - state.ball.radius - 2);
});

test('destruir o último tijolo gera vitória', () => {
  const state = playingState();
  const last = state.bricks[state.bricks.length - 1];
  for (const brick of state.bricks) brick.alive = brick === last;
  state.ball.x = last.x + last.width / 2;
  state.ball.y = last.y + last.height + state.ball.radius + 1;
  state.ball.vx = 0;
  state.ball.vy = -240;

  const events = step(state, 1 / 60);

  assert.ok(events.includes('brick'));
  assert.ok(events.includes('won'));
  assert.equal(state.status, 'won');
  assert.equal(state.score, BRICK_POINTS);
  assert.equal(state.bricks.every((brick) => !brick.alive), true);
});

test('perder a última vida gera fim de jogo', () => {
  const state = playingState();
  state.lives = 1;
  state.ball.x = 180;
  state.ball.y = HEIGHT + state.ball.radius + 1;
  state.ball.vx = 0;
  state.ball.vy = 100;

  const events = step(state, 1 / 120);

  assert.ok(events.includes('gameover'));
  assert.equal(state.status, 'gameover');
  assert.equal(state.lives, 0);
  assert.equal(state.ball.stuck, false);
});

test('pausa congela física e retomada restaura o movimento', () => {
  const state = playingState();
  state.ball.x = 100;
  state.ball.y = 300;
  state.ball.vx = 180;
  state.ball.vy = -120;
  setLeftPressed(state, true);

  assert.equal(pauseGame(state), true);
  assert.equal(state.status, 'paused');
  const beforeBall = { ...state.ball };
  const beforePaddleX = state.paddle.x;
  assert.deepEqual(step(state, 0.1), []);
  assert.deepEqual(state.ball, beforeBall);
  assert.equal(state.paddle.x, beforePaddleX);

  assert.equal(resumeGame(state), true);
  assert.equal(state.status, 'playing');
  setLeftPressed(state, false);
  step(state, 1 / 120);
  assert.notEqual(state.ball.x, beforeBall.x);

  assert.equal(togglePause(state), true);
  assert.equal(state.status, 'paused');
  assert.equal(togglePause(state), true);
  assert.equal(state.status, 'playing');
});

test('reinício restaura placar, vidas, tijolos, raquete e entradas', () => {
  const state = playingState();
  state.score = 90;
  state.lives = 1;
  state.bricks[0].alive = false;
  state.paddle.x = 12;
  state.ball.x = 44;
  setRightPressed(state, true);

  restartGame(state);

  assert.equal(state.status, 'playing');
  assert.equal(state.score, 0);
  assert.equal(state.lives, START_LIVES);
  assert.equal(state.bricks.every((brick) => brick.alive), true);
  assert.equal(state.paddle.x, (WIDTH - state.paddle.width) / 2);
  assert.equal(state.ball.stuck, true);
  assert.equal(state.input.left, false);
  assert.equal(state.input.right, false);
});

test('limpar entradas remove ambos os sentidos pressionados', () => {
  const state = playingState();
  setLeftPressed(state, true);
  setRightPressed(state, true);
  clearInput(state);
  assert.equal(state.input.left, false);
  assert.equal(state.input.right, false);
});
