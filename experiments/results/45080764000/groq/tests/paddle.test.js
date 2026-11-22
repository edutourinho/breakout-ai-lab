import { test } from 'node:test';
import assert from 'node:assert/strict';
import { movePaddle } from '../src/paddle.js';

test('moves right when direction is 1', () => {
  const result = movePaddle({ x: 10, width: 20, speed: 100 }, 1, 0.5, 500);
  assert.equal(result.x, 60);
  assert.equal(result.width, 20);
  assert.equal(result.speed, 100);
});

test('moves left when direction is -1', () => {
  const result = movePaddle({ x: 100, width: 20, speed: 100 }, -1, 0.5, 500);
  assert.equal(result.x, 50);
});

test('does not move when direction is 0', () => {
  const result = movePaddle({ x: 10, width: 20, speed: 100 }, 0, 0.5, 500);
  assert.equal(result.x, 10);
});

test('does not move when dt is 0', () => {
  const result = movePaddle({ x: 10, width: 20, speed: 100 }, 1, 0, 500);
  assert.equal(result.x, 10);
});

test('clamps to the left edge at 0', () => {
  const result = movePaddle({ x: 5, width: 20, speed: 200 }, -1, 0.5, 500);
  assert.equal(result.x, 0);
});

test('clamps to the right edge at worldWidth - width', () => {
  const result = movePaddle({ x: 480, width: 20, speed: 200 }, 1, 0.5, 500);
  assert.equal(result.x, 480);
});

test('lands exactly on the left limit', () => {
  const result = movePaddle({ x: 50, width: 20, speed: 100 }, -1, 0.5, 500);
  assert.equal(result.x, 0);
});

test('lands exactly on the right limit', () => {
  const result = movePaddle({ x: 430, width: 20, speed: 100 }, 1, 0.5, 500);
  assert.equal(result.x, 480);
});

test('does not mutate the input paddle', () => {
  const paddle = { x: 100, width: 20, speed: 50 };
  const result = movePaddle(paddle, 1, 1, 300);
  assert.equal(paddle.x, 100);
  assert.notEqual(result, paddle);
});

test('preserves extra properties on the returned object', () => {
  const result = movePaddle({ x: 10, width: 20, speed: 50, color: 'red' }, 1, 1, 300);
  assert.equal(result.color, 'red');
  assert.equal(result.x, 60);
});