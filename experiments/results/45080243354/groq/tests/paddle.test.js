import { test } from "node:test";
import assert from "node:assert/strict";
import { movePaddle } from "../src/paddle.js";

test("moves the paddle to the right", () => {
  const paddle = { x: 10, width: 20, speed: 10 };
  const result = movePaddle(paddle, 1, 1, 100);
  assert.equal(result.x, 20);
});

test("moves the paddle to the left", () => {
  const paddle = { x: 50, width: 20, speed: 10 };
  const result = movePaddle(paddle, -1, 1, 100);
  assert.equal(result.x, 40);
});

test("zero direction does not move the paddle", () => {
  const paddle = { x: 30, width: 20, speed: 10 };
  const result = movePaddle(paddle, 0, 1, 100);
  assert.equal(result.x, 30);
});

test("zero time does not move the paddle", () => {
  const paddle = { x: 30, width: 20, speed: 10 };
  const resultRight = movePaddle(paddle, 1, 0, 100);
  assert.equal(resultRight.x, 30);
  const resultLeft = movePaddle(paddle, -1, 0, 100);
  assert.equal(resultLeft.x, 30);
});

test("clamps at the left edge (0)", () => {
  const paddle = { x: 5, width: 20, speed: 100 };
  const result = movePaddle(paddle, -1, 1, 100);
  assert.equal(result.x, 0);
});

test("clamps at the right edge (worldWidth - width)", () => {
  const paddle = { x: 90, width: 20, speed: 100 };
  const result = movePaddle(paddle, 1, 1, 100);
  assert.equal(result.x, 80);
});

test("handles exact limits", () => {
  // At the left limit, moving left stays at 0.
  const atLeft = { x: 0, width: 20, speed: 10 };
  assert.equal(movePaddle(atLeft, -1, 1, 100).x, 0);

  // At the right limit, moving right stays at worldWidth - width.
  const atRight = { x: 80, width: 20, speed: 10 };
  assert.equal(movePaddle(atRight, 1, 1, 100).x, 80);

  // A move that exactly reaches a limit is preserved, not over-clamped.
  const fromMid = { x: 10, width: 20, speed: 10 };
  assert.equal(movePaddle(fromMid, 1, 7, 100).x, 80);
  assert.equal(movePaddle(fromMid, -1, 1, 100).x, 0);
});

test("returns a new object and never mutates the input", () => {
  const paddle = { x: 10, width: 20, speed: 10, id: "p1", paddle: true };
  const originalX = paddle.x;
  const originalWidth = paddle.width;
  const originalSpeed = paddle.speed;

  const result = movePaddle(paddle, 1, 1, 100);

  // Returns a distinct object.
  assert.notEqual(result, paddle);

  // Input is unmutated.
  assert.equal(paddle.x, originalX);
  assert.equal(paddle.width, originalWidth);
  assert.equal(paddle.speed, originalSpeed);
  assert.equal(paddle.id, "p1");

  // All properties except x are preserved in the result.
  assert.equal(result.width, paddle.width);
  assert.equal(result.speed, paddle.speed);
  assert.equal(result.id, "p1");
  assert.equal(result.paddle, true);

  // x was updated.
  assert.equal(result.x, 20);
});