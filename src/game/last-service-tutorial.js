import { LAST_SERVICE_LESSONS } from '../levels/last-service-script.js';

export function createLastServiceTutorial({ resumeDelay = 0.35 } = {}) {
  if (!Number.isFinite(resumeDelay) || resumeDelay < 0) throw new Error('Invalid tutorial resume delay');
  const lessons = new Map(LAST_SERVICE_LESSONS.map(lesson => [lesson.id, lesson]));
  const read = new Set();
  const completed = new Set();
  let dialogue = null;
  let remaining = 0;
  function lessonFor(id) {
    const lesson = lessons.get(id);
    if (!lesson) throw new Error('Unknown Last Service lesson: ' + id);
    return lesson;
  }
  return {
    snapshot() {
      return Object.freeze({
        dialogue,
        read: Object.freeze([...read]),
        completed: Object.freeze([...completed]),
        resumeRemaining: remaining,
        blocksWorld: dialogue !== null || remaining > 0
      });
    },
    enter(id) {
      const lesson = lessonFor(id);
      if (dialogue || remaining > 0 || read.has(id) || completed.has(id)) return false;
      dialogue = lesson;
      return true;
    },
    dismiss() {
      if (!dialogue) return false;
      read.add(dialogue.id);
      dialogue = null;
      remaining = resumeDelay;
      return true;
    },
    tick(dt, { paused = false } = {}) {
      if (!Number.isFinite(dt) || dt < 0) throw new Error('Invalid tutorial tick');
      if (!paused && !dialogue) remaining = Math.max(0, remaining - dt);
    },
    record(event) {
      if (dialogue || remaining > 0) return false;
      let changed = false;
      for (const lesson of LAST_SERVICE_LESSONS) {
        if (lesson.event === event && !completed.has(lesson.id)) {
          completed.add(lesson.id);
          changed = true;
        }
      }
      return changed;
    },
    retry() {
      dialogue = null;
      remaining = 0;
    },
    reset() {
      dialogue = null;
      remaining = 0;
      read.clear();
      completed.clear();
    }
  };
}
