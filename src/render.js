import { WIDTH, HEIGHT } from './game.js';

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function render(ctx, state) {
  ctx.setTransform(ctx.canvas.width / WIDTH, 0, 0, ctx.canvas.height / HEIGHT, 0, 0);
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  const background = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  background.addColorStop(0, '#081226');
  background.addColorStop(0.55, '#0b1730');
  background.addColorStop(1, '#050914');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
  ctx.lineWidth = 1;
  for (let y = 24; y < HEIGHT; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(WIDTH, y + 0.5);
    ctx.stroke();
  }

  for (const brick of state.bricks) {
    if (!brick.alive) continue;
    ctx.save();
    ctx.shadowColor = brick.color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = brick.color;
    roundedRect(ctx, brick.x, brick.y, brick.width, brick.height, 4);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    roundedRect(ctx, brick.x + 2, brick.y + 2, brick.width - 4, 3, 1.5);
    ctx.fill();
  }

  const paddle = state.paddle;
  ctx.save();
  ctx.shadowColor = 'rgba(56, 189, 248, 0.9)';
  ctx.shadowBlur = 16;
  const paddleGradient = ctx.createLinearGradient(paddle.x, 0, paddle.x + paddle.width, 0);
  paddleGradient.addColorStop(0, '#0ea5e9');
  paddleGradient.addColorStop(0.5, '#7dd3fc');
  paddleGradient.addColorStop(1, '#0ea5e9');
  ctx.fillStyle = paddleGradient;
  roundedRect(ctx, paddle.x, paddle.y, paddle.width, paddle.height, 5);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  roundedRect(ctx, paddle.x + 4, paddle.y + 2, paddle.width - 8, 2, 1);
  ctx.fill();

  const ball = state.ball;
  if (state.status === 'playing' && ball.stuck) {
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y - ball.radius);
    ctx.lineTo(ball.x, Math.max(4, ball.y - 70));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.save();
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = 14;
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
