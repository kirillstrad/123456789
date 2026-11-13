import { FixedClock } from '../core/clock.js';
import { Input } from '../core/input.js';
import { World } from '../game/world.js';
import { Renderer } from '../render/renderer.js';
import { Diagnostics, downloadJSON, summary } from '../ui/diagnostics.js';
import { PROFILE, SOURCE, BUILD_ID } from '../core/profile.js';
const byId = (id) => { const e = document.getElementById(id); if (!e)
    throw Error('Missing element: ' + id); return e; }, canvas = byId('game'), world = new World(), input = new Input(), clock = new FixedClock(), renderer = new Renderer(canvas), diagnostics = new Diagnostics();
let paused = false, dirty = true, lastRender = 0, pendingSimulationMs = 0, renderCount = 0, lastTimings = null;
const pauseButton = byId('pause'), backendSelect = byId('backend');
backendSelect.value = renderer.backend;
function setPaused(v) { paused = v; input.clear(); clock.reset(); diagnostics.lastFrame = null; pauseButton.textContent = paused ? 'RESUME' : 'FREEZE FRAME'; byId('status').textContent = paused ? 'FROZEN / VISUAL CONTROL' : 'WASD / ARROWS - MOVE / ITERATION 1'; dirty = true; canvas.focus(); }
function reset() { world.reset(); input.clear(); clock.reset(); diagnostics.reset(); dirty = true; canvas.focus(); }
pauseButton.onclick = () => setPaused(!paused);
byId('reset').onclick = reset;
backendSelect.onchange = () => { renderer.setBackend(backendSelect.value); backendSelect.value = renderer.backend; diagnostics.reset(); dirty = true; canvas.focus(); };
byId('report').onclick = () => downloadJSON(diagnostics.report(world.current, renderer.backend, clock.droppedSeconds));
byId('export').onclick = () => canvas.toBlob(b => { if (!b)
    return; const u = URL.createObjectURL(b), a = document.createElement('a'); a.href = u; a.download = 'ash-iron-iteration-1-frame.png'; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); });
byId('perfToggle').onclick = () => { const p = byId('perf'); p.hidden = !p.hidden; };
window.addEventListener('keydown', e => { if (e.code === 'Space' && !e.target?.matches('input,select,textarea,button')) {
    e.preventDefault();
    setPaused(!paused);
} });
window.addEventListener('blur', () => input.clear());
document.addEventListener('visibilitychange', () => { clock.reset(); input.clear(); diagnostics.lastFrame = null; });
window.addEventListener('error', e => { diagnostics.errors.push(e.message); byId('status').textContent = 'ERROR: ' + e.message; });
window.addEventListener('unhandledrejection', e => diagnostics.errors.push(String(e.reason)));
function perf() { const v = diagnostics.records.slice(-120), s = summary(v.map(v => v.frameMs)); byId('perfText').textContent = `BUILD ${BUILD_ID}\nBACKEND ${renderer.backend}\nFPS ${s?.fps ?? '--'}\nFRAME ${s?.meanMs ?? '--'} ms\nP95 ${s?.p95Ms ?? '--'} ms\nSIM ${(v.at(-1)?.simulationMs ?? 0).toFixed(2)} ms\nCPU SUBMIT ${(lastTimings?.cpuSubmitMs ?? 0).toFixed(2)} ms\nGPU TIME NOT MEASURED\n196 x 140 / ZOOM 65\n${renderer.gpuError ?? ''}`; }
function frame(now) { if (document.hidden) {
    clock.reset();
    requestAnimationFrame(frame);
    return;
} const r = clock.advance(now, paused, dt => { const t = performance.now(); world.update(dt, input.vector()); pendingSimulationMs += performance.now() - t; }); if (dirty || (!paused && now - lastRender >= 1000 / 30 - .4)) {
    const s = paused ? { ...world.current } : world.snapshot(r.alpha);
    lastTimings = renderer.draw(s);
    if (!paused)
        diagnostics.record(now, pendingSimulationMs, lastTimings);
    pendingSimulationMs = 0;
    renderCount++;
    dirty = false;
    lastRender += 1000 / 30;
    if (now - lastRender > 1000 / 30)
        lastRender = now;
    if (renderCount % 15 === 0)
        perf();
} requestAnimationFrame(frame); }
window.__ASH_ITERATION_1__ = Object.freeze({ state: () => ({ ...world.current }), pause: setPaused, reset, backend: (b) => { renderer.setBackend(b); backendSelect.value = renderer.backend; dirty = true; diagnostics.reset(); }, report: () => diagnostics.report(world.current, renderer.backend, clock.droppedSeconds), getBackend: () => renderer.backend, getRenderCount: () => renderCount, source: SOURCE, profile: PROFILE, buildId: BUILD_ID });
byId('status').textContent = renderer.gpuError ? 'WEBGL2 UNAVAILABLE / REFERENCE FALLBACK' : 'WASD / ARROWS - MOVE / ITERATION 1';
requestAnimationFrame(frame);
