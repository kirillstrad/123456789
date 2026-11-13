const MOVES = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
export class Input {
    target;
    keys = new Set();
    constructor(target = window) {
        this.target = target;
        target.addEventListener('keydown', this.down);
        target.addEventListener('keyup', this.up);
        target.addEventListener('blur', this.clear);
    }
    down = (e) => { if (e.target?.matches('input,select,textarea'))
        return; if (MOVES.has(e.code)) {
        e.preventDefault();
        this.keys.add(e.code);
    } };
    up = (e) => { this.keys.delete(e.code); };
    clear = () => { this.keys.clear(); };
    vector() { const has = (...k) => k.some(v => this.keys.has(v)), sx = +has('KeyD', 'ArrowRight') - +has('KeyA', 'ArrowLeft'), sy = +has('KeyS', 'ArrowDown') - +has('KeyW', 'ArrowUp'); let x = (sx + sy) * Math.SQRT1_2, y = (sy - sx) * Math.SQRT1_2, n = Math.hypot(x, y); return n ? { x: x / n, y: y / n } : { x: 0, y: 0 }; }
    dispose() { this.target.removeEventListener('keydown', this.down); this.target.removeEventListener('keyup', this.up); this.target.removeEventListener('blur', this.clear); }
}
