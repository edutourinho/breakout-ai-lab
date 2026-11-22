import { test } from 'node:test';
import assert from 'node:assert/strict';
import { movePaddle } from '../src/paddle.js';

test('moves right by speed times dt', () => {
  const paddle = { x: 10, width: 20, speed: 5 };

  const result = movePaddle(paddle, 1, 3, 200);

  assert.strictEqual(result.x, 25);
  assert.deepStrictEqual(result, { x: 25, width: 20, speed: 5 });
});

test('moves left by speed times dt', () => {
  const paddle = { x: 50, width: 20, speed: 5 };

  const result = movePaddle(paddle, -1, 4, 200);

  assert.strictEqual(result.x, 30);
  assert.deepStrictEqual(result, { x: 30, width: 20, speed: 5 });
});

test('zero direction and zero dt leave x unchanged', () => {
  const paddle = { x: 42, width: 10, speed: 7 };

  assert.strictEqual(movePaddle(paddle, 0, 10, 200).x, 42);
  assert.strictEqual(movePaddle(paddle, 1, 0, 200).x, 42);
  assert.strictEqual(movePaddle(paddle, -1, 0, 200).x, 42);
});

test('clamps to the left wall when movement goes past zero', () => {
  const paddle = { x: 10, width: 20, speed: 7 };

  assert.strictEqual(movePaddle(paddle, -1, 5, 200).x, 0);
});

test('clamps to the right wall when movement goes past the maximum', () => {
  const paddle = { x: 160, width: 20, speed: 15 };

  assert.strictEqual(movePaddle(paddle, 1, 5, 200).x, 180);
});

test('handles exact left and right limits', () => {
  const reachesLeft = { x: 20, width: 10, speed: 4 };
  const reachesRight = { x: 60, width: 10, speed: 6 };

  assert.strictEqual(movePaddle(reachesLeft, -1, 5, 100).x, 0);
  assert.strictEqual(movePaddle(reachesRight, 1, 5, 100).x, 90);

  const atLeft = { x: 0, width: 10, speed: 4 };
  const atRight = { x: 90, width: 10, speed: 4 };

  assert.strictEqual(movePaddle(atLeft, -1, 5, 100).x, 0);
  assert.strictEqual(movePaddle(atRight, 1, 5, 100).x, 90);
});

test('returns a new object, preserves other properties, and does not mutate input', () => {
  const nested = { id: 1 };
  const paddle = Object.freeze({
    x: 40,
    width: 20,
    speed: 5,
    label: 'player-one',
    nested,
  });

  const result = movePaddle(paddle, 1, 2, 200);

  assert.notStrictEqual(result, paddle);
  assert.strictEqual(paddle.x, 40);
  assert.strictEqual(result.x, 50);
  assert.strictEqual(result.width, 20);
  assert.strictEqual(result.speed, 5);
  assert.strictEqual(result.label, 'player-one');
  assert.strictEqual(result.nested, nested);
  assert.deepStrictEqual(result, {
    x: 50,
    width: 20,
    speed: 5,
    label: 'player-one',
    nested,
  });
});
