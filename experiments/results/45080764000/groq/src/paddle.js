export function movePaddle(paddle, direction, dt, worldWidth) {
  const maxX = worldWidth - paddle.width;
  const nextX = paddle.x + direction * paddle.speed * dt;
  const clampedX = Math.min(Math.max(nextX, 0), maxX);
  return { ...paddle, x: clampedX };
}