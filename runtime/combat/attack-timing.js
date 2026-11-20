// Normalized phase boundaries. Presentation and damage share contact time.
const LIGHT = Object.freeze({ prep: .21, ready: .47, contact: .545, follow: .65, queueStart: .06, queueEnd: .87, release: .98 });
const HEAVY = Object.freeze({ prep: .28, ready: .54, contact: .623, follow: .73, queueStart: .06, queueEnd: .89, release: .99 });
export function attackTiming(kind) {
    return kind === 'heavy' ? HEAVY : LIGHT;
}
