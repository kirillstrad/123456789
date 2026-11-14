import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {CombatWorld} from '../runtime/game/combat-world.js';
import {combatHero} from '../runtime/animation/combat-hero.js';
import {MOTION, angleDelta} from '../runtime/animation/motion.js';

vm.runInThisContext(fs.readFileSync('public/vendor/hero.js', 'utf8'));
const dt = 1 / 60;
function make() {
  const w = new CombatWorld({circles: [], rects: []});
  w.current.enemy.hp = 0;
  return w;
}
function step(w, count, input = {x: 0, y: 0}) {
  for (let i = 0; i < count; i++) w.step(dt, input);
}
function finiteFrame(w) {
  const s = w.snapshot();
  for (const value of [s.x, s.y, s.walkDistance, ...Object.values(s.motion)]) {
    assert.ok(Number.isFinite(value));
  }
  for (const part of combatHero(s).parts) {
    for (const point of part.v) assert.ok(point.every(Number.isFinite));
  }
}

test('3C: sharp reversals respect the visual turn-rate bound', () => {
  const w = make();
  for (const input of [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}]) {
    for (let i = 0; i < 35; i++) {
      const before = w.current.motion.heading;
      w.step(dt, input);
      assert.ok(Math.abs(angleDelta(before, w.current.motion.heading)) <= MOTION.turnRate * dt + 1e-9);
      assert.ok(w.current.motion.speed <= MOTION.maxSpeed + 1e-9);
      finiteFrame(w);
    }
  }
});

test('3C: stopping settles and stays stationary', () => {
  const w = make();
  step(w, 40, {x: 1, y: 1});
  step(w, 120);
  const {x, y, walkDistance} = w.current;
  step(w, 120);
  assert.equal(w.current.x, x);
  assert.equal(w.current.y, y);
  assert.equal(w.current.walkDistance, walkDistance);
  assert.equal(w.current.motion.speed, 0);
  assert.equal(w.current.motion.weight, 0);
  finiteFrame(w);
});

test('3C: repeated and out-of-order render sampling does not alter simulation', () => {
  const w = make();
  step(w, 35, {x: 1, y: 0});
  step(w, 8, {x: 0, y: -1});
  const before = JSON.stringify({current: w.current, previous: w.previous});
  const reference = combatHero(w.snapshot(.5));
  for (const alpha of [1, 0, .75, .25, .5, .5, 1]) combatHero(w.snapshot(alpha));
  assert.deepEqual(combatHero(w.snapshot(.5)), reference);
  assert.equal(JSON.stringify({current: w.current, previous: w.previous}), before);
});

test('3C: reset during a turn removes previous movement history', () => {
  const w = make();
  step(w, 30, {x: 1, y: 0});
  step(w, 7, {x: -1, y: 0});
  w.reset();
  const fresh = new CombatWorld({circles: [], rects: []});
  for (const alpha of [0, .5, 1]) assert.deepEqual(w.snapshot(alpha), fresh.snapshot(alpha));
});

test('3C: identical input histories give identical hero geometry', () => {
  const a = make(), b = make();
  for (const input of [{x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: -1}, {x: 0, y: 0}]) {
    step(a, 25, input);
    step(b, 25, input);
    assert.deepEqual(a.snapshot(), b.snapshot());
    assert.deepEqual(combatHero(a.snapshot()), combatHero(b.snapshot()));
  }
});

test('3C: an attack after a turn keeps its locked direction', () => {
  const w = make();
  step(w, 30, {x: 1, y: 0});
  step(w, 7, {x: 0, y: 1});
  assert.equal(w.attack({kind: 'light', aim: {x: w.current.x, y: w.current.y - 5}}), true);
  assert.ok(w.current.action);
  const {fx, fy} = w.current.action;
  for (let i = 0; i < 12; i++) {
    w.step(dt, {x: -1, y: 0});
    assert.ok(w.current.action);
    assert.equal(w.current.action.fx, fx);
    assert.equal(w.current.action.fy, fy);
    finiteFrame(w);
  }
});
