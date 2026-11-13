export class FixedClock {
    step = 1 / 60;
    maxSteps = 6;
    accumulator = 0;
    last = null;
    droppedSeconds = 0;
    reset() { this.accumulator = 0; this.last = null; }
    advance(nowMs, paused, update) { if (this.last === null) {
        this.last = nowMs;
        return { alpha: 0, steps: 0 };
    } let delta = Math.max(0, (nowMs - this.last) / 1000); this.last = nowMs; if (paused) {
        this.accumulator = 0;
        return { alpha: 0, steps: 0 };
    } if (delta > .1) {
        this.droppedSeconds += delta - .1;
        delta = .1;
    } this.accumulator += delta; let steps = 0; while (this.accumulator + 1e-10 >= this.step && steps < this.maxSteps) {
        update(this.step);
        this.accumulator -= this.step;
        steps++;
    } if (this.accumulator >= this.step) {
        this.droppedSeconds += this.accumulator;
        this.accumulator = 0;
    } return { alpha: Math.max(0, this.accumulator / this.step), steps }; }
}
