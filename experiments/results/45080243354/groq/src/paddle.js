"use strict";

/**
 * Move a paddle horizontally without mutating the input.
 *
 * @param {object} paddle - Paddle state with at least `x`, `width`, `speed`.
 * @param {-1 | 0 | 1} direction - Movement direction.
 * @param {number} dt - Time step (>= 0).
 * @param {number} worldWidth - Total width of the world.
 * @returns {object} A new paddle object with an updated `x` clamped to
 *   [0, worldWidth - paddle.width]. All other properties are preserved.
 */
export function movePaddle(paddle, direction, dt, worldWidth) {
  const newX = paddle.x + direction * paddle.speed * dt;
  const minX = 0;
  const maxX = worldWidth - paddle.width;

  const clampedX = Math.min(Math.max(newX, minX), maxX);

  return {
    ...paddle,
    x: clampedX,
  };
}