import { LAMP_LIFE } from '../combat/lamp-life.js';

const states = new WeakMap();

const clamp = value => Math.max(0, Math.min(1, value));
const mix = (a, b, t) => a + (b - a) * t;

export function composeCombatHud(
  scene,
  cols,
  sceneRows,
  frameRows,
  hud,
  s,
  ready,
  cooldown,
) {
  const size = cols * frameRows * 4;
  let state = states.get(hud);

  if (!state || state.frame.length !== size) {
    state = {
      frame: new Uint8ClampedArray(size),
      lamp: clamp(s.lamp / LAMP_LIFE.max),
      dash: 0,
      time: s.time,
    };

    states.set(hud, state);
  }

  const frame = state.frame;

  frame.fill(0);
  frame.set(scene.subarray(0, Math.min(scene.length, size)));

  if (cols < 64 || frameRows < 30) {
    return frame;
  }

  const dt = Math.max(
    0,
    Math.min(0.1, s.time - state.time),
  );

  const easing = 1 - Math.exp(-dt / 0.11);
  const lampTarget = clamp(s.lamp / LAMP_LIFE.max);
  const available = Boolean(ready && !s.dash);

  const dashTarget = s.dash
    ? 0
    : available
      ? 1
      : cooldown > 0
        ? Math.min(
          0.94,
          clamp(1 - (s.dashCooldown ?? 0) / cooldown),
        )
        : 0;

  const ember = (
    s.lamp > 0
    && s.lamp <= LAMP_LIFE.lastEmber
  );

  state.lamp = s.lamp <= 0 || ember
    ? lampTarget
    : mix(state.lamp, lampTarget, easing);

  // Расход рывка отображается сразу.
  // Восстановление — плавно.
  state.dash = dashTarget < state.dash
    ? dashTarget
    : mix(state.dash, dashTarget, easing);

  if (available) {
    state.dash = 1;
  }

  state.time = s.time;

  // Компактная композиция по центру экрана.
  const width = Math.min(
    cols - 2,
    Math.max(1, Math.round(cols * 0.65)),
  );

  const height = Math.min(21, frameRows - 1);
  const left = Math.floor((cols - width) / 2);
  const top = frameRows - height - 1;

  function put(px, py, r, g = r, b = r) {
    const index = (
      (top + py) * cols
      + left
      + px
    ) * 4;

    frame[index] = Math.max(0, Math.min(255, r));
    frame[index + 1] = Math.max(0, Math.min(255, g));
    frame[index + 2] = Math.max(0, Math.min(255, b));
    frame[index + 3] = 255;
  }

  function stone(px, py, value) {
    put(
      px,
      py,
      value,
      value * 0.96,
      value * 0.88,
    );
  }

  function orb(px, py, x, y, cx, fill, kind) {
    const dx = (x - cx) / 18;
    const dy = (y - 14) / 11;
    const radius = Math.hypot(dx, dy);

    // Нижняя каменная подставка.
    if (
      Math.abs(x - cx) < 21
      && y > 25
      && y < 29
    ) {
      const value = y < 26.2
        ? 95
        : y > 27.7
          ? 24
          : 49;

      stone(px, py, value);
    }

    // Крупные боковые упоры без мелкого шума.
    const side = Math.abs(x - cx);

    if (
      side > 17.8
      && side < 22.5
      && y > 11 + (side - 18) * 0.7
      && y < 26
    ) {
      const value = side > 21
        ? 28
        : side < 19
          ? 82
          : 53;

      stone(px, py, value);
    }

    if (radius > 1.17) {
      return;
    }

    // Каменная оправа.
    if (radius > 1) {
      const light = clamp(
        0.5 - dx * 0.3 - dy * 0.5,
      );

      let value = 35 + light * 60;

      if (radius > 1.12) {
        value *= 0.58;
      }

      if (radius < 1.035) {
        value = 15;
      }

      stone(px, py, value);
      return;
    }

    // Тёмная внутренняя кромка.
    if (radius > 0.94) {
      put(px, py, 8, 9, 10);
      return;
    }

    const dome = Math.sqrt(
      Math.max(0, 1 - radius * radius),
    );

    const surface = 0.91 - fill * 1.82;

    const wave = Math.sin(
      dx * 5
      + s.time * 2.2
      + (kind === 'dash' ? 1.5 : 0),
    ) * 0.018;

    const filled = (
      fill > 0
      && dy >= surface + wave
    );

    let r = 9 + dome * 5;
    let g = 10 + dome * 6;
    let b = 12 + dome * 8;

    if (filled) {
      const depth = clamp(
        (dy - surface) / 1.8,
      );

      const body = (
        (0.42 + dome * 0.58)
        * (1 - depth * 0.33)
      );

      const surfaceLight = clamp(
        1 - Math.abs(dy - surface - wave) / 0.07,
      );

      if (kind === 'lamp') {
        r = 136 * body + surfaceLight * 46;
        g = (ember ? 27 : 57) * body + surfaceLight * 24;
        b = 15 * body + surfaceLight * 8;
      } else {
        r = 82 * body + surfaceLight * 39;
        g = 113 * body + surfaceLight * 45;
        b = 137 * body + surfaceLight * 49;
      }

      // Мягкое внутреннее свечение.
      const core = Math.exp(
        -(
          (dx + 0.16) ** 2 * 5
          + (dy - 0.28) ** 2 * 4
        ),
      );

      r += core * (kind === 'lamp' ? 35 : 17);
      g += core * (kind === 'lamp' ? 13 : 23);
      b += core * (kind === 'lamp' ? 3 : 27);
    }

    // Один блик на стекле.
    const reflection = Math.exp(
      -(
        (dx + 0.39) ** 2 / 0.016
        + (dy + 0.43) ** 2 / 0.065
      ),
    );

    r += reflection * 67;
    g += reflection * 66;
    b += reflection * 62;

    // Нижний боковой рефлекс.
    const rimLight = (
      clamp((radius - 0.80) / 0.14)
      * clamp(dx * 0.6 + dy * 0.5)
    );

    r += rimLight * 20;
    g += rimLight * 22;
    b += rimLight * 25;

    put(px, py, r, g, b);

    // Светлая дуга означает фактическую готовность.
    if (
      kind === 'dash'
      && available
      && radius > 0.89
      && radius < 0.94
    ) {
      put(px, py, 123, 151, 166);
    }
  }

  // Виртуальная сетка сохраняет общую композицию
  // при уменьшении всего HUD.
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const x = (px + 0.5) * 192 / width;
      const y = (py + 0.5) * 30 / height;

      // Низкая соединительная панель.
      if (
        x > 23
        && x < 169
        && y > 19
        && y < 29
      ) {
        let value = y < 20
          ? 88
          : y < 21
            ? 28
            : y > 27.8
              ? 23
              : 43;

        // Спокойная центральная поверхность.
        if (
          x > 48
          && x < 144
          && y > 21
          && y < 26.8
        ) {
          value = 23;
        }

        stone(px, py, value);

        // Нижняя фаска.
        if (y > 26.8 && y < 27.5) {
          stone(px, py, 63);
        }

        // Боковые границы центрального поля.
        if (
          (
            Math.abs(x - 48) < 0.65
            || Math.abs(x - 144) < 0.65
          )
          && y > 21
          && y < 27
        ) {
          stone(px, py, 13);
        }
      }

      orb(
        px,
        py,
        x,
        y,
        25,
        state.lamp,
        'lamp',
      );

      orb(
        px,
        py,
        x,
        y,
        167,
        state.dash,
        'dash',
      );
    }
  }

  return frame;
}