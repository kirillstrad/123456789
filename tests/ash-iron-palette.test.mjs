import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createHeroAppearance,
  HERO_ACCENT_COLOR,
  HERO_GLINT_COLOR,
} from '../runtime/render/hero-appearance.js';

test(
  'Ash and Iron separates cloth metal and selective skin accents without changing geometry',
  () => {
    const rig = {
      arms: [
        {
          joint: [0, 0, 0.8],
          end: [0, 0, 1],
        },
      ],
    };

    const before = JSON.stringify(rig);
    const appearance = createHeroAppearance(rig);
    const skin = [120, 100, 80];

    const hand = appearance.material([[0, 0, 1]], skin, 0);
    const arm = appearance.material([[0, 0, 0.9]], skin, 0);
    const face = appearance.material([[0, 0, 1.5]], skin, 0);
    const body = appearance.material([[0.5, 0, 0.5]], skin, 0);

    // Алые детали и отдельный цвет редких бликов.
    assert.equal(HERO_ACCENT_COLOR, '#873b3b');
    assert.equal(HERO_GLINT_COLOR, '#c0c6cb');

    // Ткань остаётся тёмной.
    assert.equal(
      appearance.material([[0, 0, 0]], '#413b3b', 0),
      '#29262b',
    );

    // Обычный металл отличается от редких бликов.
    const metal = appearance.material(
      [[0, 0, 0]],
      '#efd3a2',
      1,
    );

    assert.equal(metal, '#a8adb3');
    assert.notEqual(metal, HERO_GLINT_COLOR);

    // Исходный цвет лампы не перекрашивается.
    assert.equal(
      appearance.material([[0, 0, 0]], '#dbb477', 1),
      '#dbb477',
    );

    // Кисти и лицо светлее соседних участков.
    assert.ok(hand[0] > arm[0]);
    assert.ok(face[0] > body[0]);

    // Исходные данные не изменяются.
    assert.deepEqual(skin, [120, 100, 80]);
    assert.equal(JSON.stringify(rig), before);

    // Все вычисленные компоненты цвета допустимы.
    for (const values of [hand, arm, face, body]) {
      assert.ok(
        values.every(
          value =>
            Number.isFinite(value) &&
            value >= 0 &&
            value <= 255,
        ),
      );
    }
  },
);