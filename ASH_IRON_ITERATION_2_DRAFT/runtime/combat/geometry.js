export const OBSTACLES = Object.freeze({ circles: [{ x: 5, y: 5, r: .57 }, { x: 11, y: 5, r: .57 }, { x: 5, y: 12.8, r: .57 }, { x: 11, y: 12.8, r: .57 }, { x: 3.2, y: 8, r: .85 }, { x: 12.7, y: 9.2, r: .85 }, { x: 3, y: 14.5, r: .65 }, { x: 13.3, y: 5.7, r: .65 }], rects: [{ minX: 7.15, maxX: 8.85, minY: 2.52, maxY: 3.08 }] });
export function solid(x, y, map = OBSTACLES, radius = .24) { return x < 1.7 || y < 1.7 || x > 16 || y > 16 || map.circles.some(o => Math.hypot(x - o.x, y - o.y) < o.r + radius) || map.rects.some(o => x > o.minX - radius && x < o.maxX + radius && y > o.minY - radius && y < o.maxY + radius); }
function segmentRect(a, b, o) { let lo = 0, hi = 1; for (const [k, min, max] of [['x', o.minX, o.maxX], ['y', o.minY, o.maxY]]) {
    const d = b[k] - a[k];
    if (Math.abs(d) < 1e-10) {
        if (a[k] < min || a[k] > max)
            return false;
    }
    else {
        let t0 = (min - a[k]) / d, t1 = (max - a[k]) / d;
        if (t0 > t1)
            [t0, t1] = [t1, t0];
        lo = Math.max(lo, t0);
        hi = Math.min(hi, t1);
        if (lo > hi)
            return false;
    }
} return true; }
export function blocked(a, b, map = OBSTACLES) { const dx = b.x - a.x, dy = b.y - a.y, n = dx * dx + dy * dy; return map.circles.some(o => { const t = n > 0 ? Math.max(0, Math.min(1, ((o.x - a.x) * dx + (o.y - a.y) * dy) / n)) : 0; return Math.hypot(a.x + t * dx - o.x, a.y + t * dy - o.y) < o.r; }) || map.rects.some(o => segmentRect(a, b, o)); }
export function inArc(origin, target, facing, reach, arcDegrees) { const dx = target.x - origin.x, dy = target.y - origin.y, d = Math.hypot(dx, dy); return d <= reach && (d < 1e-8 || (dx * facing.x + dy * facing.y) / d >= Math.cos(arcDegrees * .5 * Math.PI / 180)); }
