import { SceneBuilder } from './scene.js';
import { createReferenceBackend } from './reference-backend.js';
import { WebGLRenderer } from './webgl.js';
export class Renderer {
    canvas;
    scene = new SceneBuilder();
    reference = createReferenceBackend();
    gpu = null;
    output;
    backend = 'WEBGL2';
    gpuError = null;
    constructor(canvas) {
        this.canvas = canvas;
        canvas.width = 1008;
        canvas.height = 864;
        const c = canvas.getContext('2d');
        if (!c)
            throw Error('Canvas2D unavailable');
        this.output = c;
        try {
            this.gpu = new WebGLRenderer();
        }
        catch (e) {
            this.gpuError = String(e);
            this.backend = 'REFERENCE';
        }
    }
    setBackend(b) { this.backend = b === 'WEBGL2' && this.gpu ? 'WEBGL2' : 'REFERENCE'; }
    draw(s) { const start = performance.now(), f = this.scene.build(s), o = this.output; o.fillStyle = '#000'; o.fillRect(0, 0, 1008, 864); let t; if (this.backend === 'WEBGL2' && this.gpu) {
        try {
            t = this.gpu.render(f, o);
        }
        catch (e) {
            this.gpuError = String(e);
            this.backend = 'REFERENCE';
            t = this.reference.draw(f, o);
        }
    }
    else
        t = this.reference.draw(f, o); this.hud(); return { backend: this.backend, geometryMs: f.geometryMs, animationMs: f.animationMs, ...t, cpuSubmitMs: performance.now() - start }; }
    hud() { const c = this.output; c.fillStyle = '#000'; c.fillRect(0, 720, 1008, 144); c.strokeStyle = '#94887f'; c.lineWidth = 1; for (const side of [-1, 1]) {
        c.save();
        c.translate(504, 720);
        c.scale(side, 1);
        c.beginPath();
        c.moveTo(20, 58);
        c.lineTo(48, 43);
        c.lineTo(81, 55);
        c.lineTo(118, 38);
        c.lineTo(152, 49);
        c.lineTo(198, 38);
        c.lineTo(249, 54);
        c.lineTo(294, 41);
        c.lineTo(339, 57);
        c.stroke();
        c.restore();
    } c.strokeStyle = '#b5a18f'; c.beginPath(); c.moveTo(504, 740); c.lineTo(517, 756); c.lineTo(504, 772); c.lineTo(491, 756); c.closePath(); c.moveTo(504, 772); c.lineTo(504, 807); c.moveTo(492, 784); c.lineTo(516, 784); c.stroke(); c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.font = '13px monospace'; c.fillStyle = '#bba28b'; c.fillText('LAMP', 504, 827); c.font = '11px monospace'; c.fillStyle = '#8f7b69'; c.fillText('100 / 100', 504, 850); c.textAlign = 'left'; }
}
