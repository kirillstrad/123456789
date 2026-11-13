import { PROFILE, SOURCE, BUILD_ID } from '../core/profile.js';
export function summary(v) { if (!v.length)
    return null; const a = [...v].sort((a, b) => a - b), mean = a.reduce((s, x) => s + x, 0) / a.length; return { samples: a.length, meanMs: +mean.toFixed(3), p95Ms: +a[Math.floor((a.length - 1) * .95)].toFixed(3), maxMs: +a[a.length - 1].toFixed(3), fps: +(1000 / Math.max(.001, mean)).toFixed(2) }; }
export class Diagnostics {
    records = [];
    errors = [];
    lastFrame = null;
    record(at, simulationMs, t) { if (this.lastFrame !== null) {
        const d = at - this.lastFrame;
        if (d > 0 && d < 1000)
            this.records.push({ ...t, frameMs: d, simulationMs, at });
    } this.lastFrame = at; if (this.records.length > 1800)
        this.records.shift(); }
    reset() { this.records = []; this.lastFrame = null; }
    report(s, backend, dropped) { const r = this.records; return { buildId: BUILD_ID, source: SOURCE, profile: PROFILE, backend, state: s, droppedSimulationSeconds: dropped, summary: { frames: summary(r.map(v => v.frameMs)), simulation: summary(r.map(v => v.simulationMs)), geometry: summary(r.map(v => v.geometryMs)), animation: summary(r.map(v => v.animationMs)), lighting: summary(r.map(v => v.lightingMs)), glyph: summary(r.map(v => v.glyphMs)), cpuSubmission: summary(r.map(v => v.cpuSubmitMs)) }, gpuTime: null, errors: this.errors, records: r, notes: ['Iteration 1: no combat, AI, execution, ash transfer or progression.', 'CPU timing is not isolated GPU time.', 'REFERENCE retains supplied native Canvas lighting and glyph functions.', 'WEBGL2 uses area averaging, not brightest-point sampling. Final visual approval is manual.'] }; }
}
export function downloadJSON(data) { const u = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })), a = document.createElement('a'); a.href = u; a.download = 'ash-iron-iteration-1-report.json'; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); }
