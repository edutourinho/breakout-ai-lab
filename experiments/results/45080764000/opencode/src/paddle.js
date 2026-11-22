export function movePaddle(paddle, direction, dt, worldWidth) {
  const maxX = worldWidth - paddle.width;
  const nextX = paddle.x + direction * paddle.speed * dt;
  const clampedX = Math.min(maxX, Math.max(0, nextX));

  return { ...paddle, x: clampedX };
}
