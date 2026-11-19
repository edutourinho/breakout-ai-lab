export const WIDTH = 360;
export const HEIGHT = 520;
export const FIXED_STEP = 1 / 120;
export const MAX_FRAME_TIME = 0.1;
export const START_LIVES = 3;
export const BRICK_POINTS = 10;
export const BALL_RADIUS = 6;

const PADDLE_WIDTH = 64;
const PADDLE_HEIGHT = 10;
const PADDLE_Y = HEIGHT - 38;
const PADDLE_SPEED = 300;
const BALL_SPEED = 280;
const BALL_MAX_SPEED = 460;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_WIDTH = 38;
const BRICK_HEIGHT = 16;
const BRICK_GAP_X = 6;
const BRICK_GAP_Y = 7;
const BRICK_TOP = 54;
const BRICK_COLORS = ['#f472b6', '#fb923c', '#facc15', '#4ade80', '#38bdf8'];
const MAX_SUBSTEPS = 64;
const EPSILON = 0.01;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createBricks() {
  const bricks = [];
  const gridWidth = BRICK_COLS * BRICK_WIDTH + (BRICK_COLS - 1) * BRICK_GAP_X;
  const offsetX = (WIDTH - gridWidth) / 2;
  for (let row = 0; row < BRICK_ROWS; row += 1) {
    for (let col = 0; col < BRICK_COLS; col += 1) {
      bricks.push({
        x: offsetX + col * (BRICK_WIDTH + BRICK_GAP_X),
        y: BRICK_TOP + row * (BRICK_HEIGHT + BRICK_GAP_Y),
        width: BRICK_WIDTH,
        height: BRICK_HEIGHT,
        row,
        col,
        color: BRICK_COLORS[row],
        points: BRICK_POINTS,
        alive: true
      });
    }
  }
  return bricks;
}

function attachBall(state) {
  const { ball, paddle } = state;
  ball.x = paddle.x + paddle.width / 2;
  ball.y = paddle.y - ball.radius - 2;
  ball.vx = 0;
  ball.vy = 0;
  ball.stuck = true;
}

export function createInitialState() {
  const state = {
    status: 'ready',
    score: 0,
    lives: START_LIVES,
    paddle: {
      x: (WIDTH - PADDLE_WIDTH) / 2,
      y: PADDLE_Y,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: PADDLE_SPEED
    },
    ball: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: BALL_RADIUS,
      stuck: true
    },
    bricks: createBricks(),
    input: { left: false, right: false }
  };
  attachBall(state);
  return state;
}

export function startGame(state) {
  if (state.status !== 'ready') return false;
  state.status = 'playing';
  return true;
}

export function restartGame(state) {
  const fresh = createInitialState();
  fresh.status = 'playing';
  for (const key of Object.keys(state)) delete state[key];
  Object.assign(state, fresh);
  return state;
}

export function pauseGame(state) {
  if (state.status !== 'playing') return false;
  state.status = 'paused';
  return true;
}

export function resumeGame(state) {
  if (state.status !== 'paused') return false;
  state.status = 'playing';
  return true;
}

export function togglePause(state) {
  if (state.status === 'playing') return pauseGame(state);
  if (state.status === 'paused') return resumeGame(state);
  return false;
}

export function launchBall(state) {
  if (state.status !== 'playing' || !state.ball.stuck) return false;
  state.ball.stuck = false;
  state.ball.vx = BALL_SPEED * 0.45;
  state.ball.vy = -Math.sqrt(BALL_SPEED * BALL_SPEED - state.ball.vx * state.ball.vx);
  return true;
}

export function setLeftPressed(state, pressed) {
  state.input.left = Boolean(pressed);
}

export function setRightPressed(state, pressed) {
  state.input.right = Boolean(pressed);
}

export function clearInput(state) {
  state.input.left = false;
  state.input.right = false;
}

function updatePaddle(state, dt) {
  const direction = Number(state.input.right) - Number(state.input.left);
  state.paddle.x = clamp(
    state.paddle.x + direction * state.paddle.speed * dt,
    0,
    WIDTH - state.paddle.width
  );
  if (state.ball.stuck) attachBall(state);
}

function circleHitsRect(ball, rect) {
  const closestX = clamp(ball.x, rect.x, rect.x + rect.width);
  const closestY = clamp(ball.y, rect.y, rect.y + rect.height);
  const dx = ball.x - closestX;
  const dy = ball.y - closestY;
  return dx * dx + dy * dy <= ball.radius * ball.radius;
}

function bounceOffBrick(ball, brick, prevX, prevY) {
  const r = ball.radius;
  const fromTop = ball.vy > 0 && prevY + r <= brick.y + EPSILON;
  const fromBottom = ball.vy < 0 && prevY - r >= brick.y + brick.height - EPSILON;
  const fromLeft = ball.vx > 0 && prevX + r <= brick.x + EPSILON;
  const fromRight = ball.vx < 0 && prevX - r >= brick.x + brick.width - EPSILON;

  if (fromTop || fromBottom) {
    if (fromTop) {
      ball.y = brick.y - r - EPSILON;
      ball.vy = -Math.abs(ball.vy);
    } else {
      ball.y = brick.y + brick.height + r + EPSILON;
      ball.vy = Math.abs(ball.vy);
    }
    return;
  }

  if (fromLeft || fromRight) {
    if (fromLeft) {
      ball.x = brick.x - r - EPSILON;
      ball.vx = -Math.abs(ball.vx);
    } else {
      ball.x = brick.x + brick.width + r + EPSILON;
      ball.vx = Math.abs(ball.vx);
    }
    return;
  }

  const overlapX = Math.min(
    ball.x + r - brick.x,
    brick.x + brick.width - (ball.x - r)
  );
  const overlapY = Math.min(
    ball.y + r - brick.y,
    brick.y + brick.height - (ball.y - r)
  );

  if (overlapX < overlapY) {
    if (ball.vx > 0) {
      ball.x = brick.x - r - EPSILON;
      ball.vx = -Math.abs(ball.vx);
    } else {
      ball.x = brick.x + brick.width + r + EPSILON;
      ball.vx = Math.abs(ball.vx);
    }
  } else if (ball.vy > 0) {
    ball.y = brick.y - r - EPSILON;
    ball.vy = -Math.abs(ball.vy);
  } else {
    ball.y = brick.y + brick.height + r + EPSILON;
    ball.vy = Math.abs(ball.vy);
  }
}

function advanceBall(state, dt) {
  const events = [];
  const { ball, paddle } = state;
  const prevX = ball.x;
  const prevY = ball.y;

  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.vx = Math.abs(ball.vx);
    events.push('wall');
  } else if (ball.x + ball.radius > WIDTH) {
    ball.x = WIDTH - ball.radius;
    ball.vx = -Math.abs(ball.vx);
    events.push('wall');
  }

  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.vy = Math.abs(ball.vy);
    events.push('wall');
  }

  const crossedPaddleTop = prevY + ball.radius <= paddle.y + EPSILON;
  const overlapsPaddleY =
    ball.y + ball.radius >= paddle.y && ball.y - ball.radius <= paddle.y + paddle.height;
  const overlapsPaddleX =
    ball.x + ball.radius >= paddle.x && ball.x - ball.radius <= paddle.x + paddle.width;

  if (ball.vy > 0 && crossedPaddleTop && overlapsPaddleY && overlapsPaddleX) {
    ball.y = paddle.y - ball.radius - EPSILON;
    const offset = clamp(
      (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2),
      -1,
      1
    );
    const angle = offset * (Math.PI / 3);
    const speed = clamp(
      Math.hypot(ball.vx, ball.vy) * 1.015,
      BALL_SPEED,
      BALL_MAX_SPEED
    );
    ball.vx = Math.sin(angle) * speed;
    ball.vy = -Math.cos(angle) * speed;
    events.push('paddle');
  }

  for (const brick of state.bricks) {
    if (!brick.alive || !circleHitsRect(ball, brick)) continue;
    brick.alive = false;
    state.score += brick.points;
    bounceOffBrick(ball, brick, prevX, prevY);
    events.push('brick');
    if (state.bricks.every((item) => !item.alive)) {
      state.status = 'won';
      events.push('won');
    }
    break;
  }

  if (ball.y - ball.radius > HEIGHT) {
    state.lives -= 1;
    if (state.lives <= 0) {
      state.lives = 0;
      state.status = 'gameover';
      events.push('gameover');
    } else {
      attachBall(state);
      events.push('lifeLost');
    }
  }

  return events;
}

export function step(state, dt) {
  if (state.status !== 'playing' || !Number.isFinite(dt) || dt <= 0) return [];

  const boundedDt = Math.min(dt, MAX_FRAME_TIME);
  updatePaddle(state, boundedDt);
  if (state.ball.stuck) return [];

  const speed = Math.hypot(state.ball.vx, state.ball.vy);
  const travel = speed * boundedDt;
  const substeps = Math.min(
    MAX_SUBSTEPS,
    Math.max(1, Math.ceil(travel / (state.ball.radius * 0.6)))
  );
  const slice = boundedDt / substeps;
  const events = [];

  for (let index = 0; index < substeps; index += 1) {
    events.push(...advanceBall(state, slice));
    if (state.status !== 'playing' || state.ball.stuck) break;
  }

  return events;
}
