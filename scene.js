import { PROFILE } from '../core/profile.js';
import { createEnvironment } from './environment.js';
import { heroParts } from '../animation/hero.js';
export function project(x, y, z, s) { return [504 + ((x - s.cameraX) - (y - s.cameraY)) * PROFILE.zoom * .76, 430 + ((x - s.cameraX) + (y - s.cameraY)) * PROFILE.zoom * .43 - z * PROFILE.zoom * .87]; }
function css(c) { return typeof c === 'string' ? c : `rgb(${c.map(v => Math.round(Math.max(0, Math.min(255, v)))).join(',')})`; }
export class SceneBuilder {
    scene = document.createElement('canvas');
    mask = document.createElement('canvas');
    context;
    maskContext;
    environment = createEnvironment();
    constructor() { this.scene.width = this.mask.width = 1008; this.scene.height = this.mask.height = 720; const a = this.scene.getContext('2d'), b = this.mask.getContext('2d'); if (!a || !b)
        throw Error('Canvas2D unavailable'); this.context = a; this.maskContext = b; }
    part(ctx, a, s, mask) { ctx.fillStyle = mask ? (a.hero ? '#fff' : '#000') : css(a.c); ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = a.w || 1; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; if (a.kind === 2) {
        const p = project(...a.v[0], s), r = a.r || 0;
        ctx.beginPath();
        ctx.ellipse(p[0], p[1], r * 65 / 94, r * .85 * 65 / 94, 0, 0, 7);
        ctx.fill();
        return;
    } ctx.beginPath(); a.v.forEach((v, i) => { const p = project(...v, s); if (i)
        ctx.lineTo(...p);
    else
        ctx.moveTo(...p); }); if (a.kind === 1)
        ctx.stroke();
    else {
        ctx.closePath();
        ctx.fill();
        if (a.s) {
            ctx.strokeStyle = mask ? ctx.fillStyle : css(a.s);
            ctx.stroke();
        }
    } }
    build(state) { const start = performance.now(), h0 = performance.now(), hero = heroParts(state), animationMs = performance.now() - h0, parts = [...this.environment.parts, ...hero.parts].sort((a, b) => a.d - b.d), g = this.context, mg = this.maskContext; g.fillStyle = '#020306'; g.fillRect(0, 0, 1008, 720); mg.fillStyle = '#000'; mg.fillRect(0, 0, 1008, 720); let started = false; for (const a of parts) {
        this.part(g, a, state, false);
        if (a.hero)
            started = true;
        if (started)
            this.part(mg, a, state, true);
    } return { scene: this.scene, mask: this.mask, parts, lights: this.environment.lights.map(l => { const p = project(l.x, l.y, l.z, state); return { x: p[0], y: p[1], r: l.r, power: l.power }; }), lamp: project(...hero.lamp, state), time: state.time, geometryMs: performance.now() - start - animationMs, animationMs }; }
}
