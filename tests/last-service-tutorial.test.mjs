import test from 'node:test';
import assert from 'node:assert/strict';
import { LAST_SERVICE_LESSONS, LAST_SERVICE_SCENES } from '../src/levels/last-service-script.js';
import { createLastServiceTutorial } from '../src/game/last-service-tutorial.js';

test('Last Service lesson and scene identifiers are unique', () => {
  for (const items of [LAST_SERVICE_LESSONS, LAST_SERVICE_SCENES]) {
    assert.equal(new Set(items.map(item => item.id)).size, items.length);
    assert.ok(Object.isFrozen(items));
    assert.ok(items.every(Object.isFrozen));
  }
  assert.ok(LAST_SERVICE_SCENES.every(scene => scene.implementation === 'pending'));
});

test('dialogue blocks gameplay and consumes dismissal before resume', () => {
  const tutorial = createLastServiceTutorial();
  assert.equal(tutorial.enter('light'), true);
  assert.equal(tutorial.snapshot().blocksWorld, true);
  assert.equal(tutorial.enter('door'), false);
  assert.equal(tutorial.record('small-light-ignited'), false);
  assert.equal(tutorial.dismiss(), true);
  assert.equal(tutorial.dismiss(), false);
  assert.equal(tutorial.record('small-light-ignited'), false);
  tutorial.tick(1, { paused: true });
  assert.equal(tutorial.snapshot().blocksWorld, true);
  tutorial.tick(1);
  assert.equal(tutorial.snapshot().blocksWorld, false);
  assert.equal(tutorial.record('small-light-ignited'), true);
  assert.equal(tutorial.record('small-light-ignited'), false);
});

test('actions performed early suppress redundant instruction', () => {
  const tutorial = createLastServiceTutorial();
  assert.equal(tutorial.record('dodge-started'), true);
  assert.equal(tutorial.enter('dodge'), false);
  assert.equal(tutorial.enter('attack'), true);
});

test('retry preserves read lessons but unread dialogue can return', () => {
  const tutorial = createLastServiceTutorial();
  tutorial.enter('light');
  tutorial.dismiss();
  tutorial.retry();
  assert.equal(tutorial.enter('light'), false);
  assert.equal(tutorial.enter('door'), true);
  tutorial.retry();
  assert.equal(tutorial.enter('door'), true);
  tutorial.reset();
  assert.deepEqual(tutorial.snapshot().read, []);
  assert.equal(tutorial.enter('light'), true);
});

test('snapshots cannot mutate tutorial progress', () => {
  const tutorial = createLastServiceTutorial();
  const snapshot = tutorial.snapshot();
  assert.throws(() => snapshot.read.push('light'), TypeError);
  assert.equal(tutorial.enter('light'), true);
  assert.throws(() => { tutorial.snapshot().dialogue.id = 'changed'; }, TypeError);
});

test('invalid identifiers and time values fail explicitly', () => {
  assert.throws(() => createLastServiceTutorial({ resumeDelay: NaN }));
  const tutorial = createLastServiceTutorial();
  assert.throws(() => tutorial.enter('missing'));
  for (const dt of [-1, Infinity, NaN]) assert.throws(() => tutorial.tick(dt));
  assert.equal(tutorial.record('unknown-event'), false);
});
