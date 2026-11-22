import test from 'node:test';
import assert from 'node:assert/strict';
import { movePaddle } from './src/paddle.js';

test('left/right use speed and elapsed seconds', () => {
  assert.equal(movePaddle({x:100,width:40,speed:200},1,0.25,360).x,150);
  assert.equal(movePaddle({x:100,width:40,speed:200},-1,0.25,360).x,50);
});
test('both boundaries and exact landings', () => {
  assert.equal(movePaddle({x:10,width:40,speed:200},-1,1,360).x,0);
  assert.equal(movePaddle({x:310,width:40,speed:200},1,1,360).x,320);
  assert.equal(movePaddle({x:10,width:40,speed:200},-1,0.05,360).x,0);
  assert.equal(movePaddle({x:310,width:40,speed:200},1,0.05,360).x,320);
  assert.equal(movePaddle({x:0,width:360,speed:200},1,2,360).x,0);
});
test('zero direction/time/speed do not move', () => {
  for (const [direction,dt,speed] of [[0,1,200],[1,0,200],[-1,5,0]])
    assert.equal(movePaddle({x:100,width:40,speed},direction,dt,360).x,100);
});
test('preserves properties, returns a fresh object, and accepts frozen input', () => {
  const input=Object.freeze({x:100,width:40,speed:200,label:'paddle',meta:{id:1}});
  const result=movePaddle(input,1,0.25,360);
  assert.notEqual(result,input);
  assert.deepEqual(result,{...input,x:150});
  assert.equal(input.x,100);
});
