import { TUNNEL_MAX_BEND_DEG, TUNNEL_SEGMENT_LENGTH } from '../constants/canvasDefaults';
import type { TunnelEnd, TunnelPoint } from '../types/obstacleTypes';

/**
 * Tunnel chain geometry (US-020): pure helpers for the flexible tube.
 *
 * The tunnel is modeled as a chain of joints (one per ~50 cm segment)
 * expressed in local centimeters (pre-ratio), centered on (0, 0) when
 * created. All computations are pure and framework-free so they can be
 * unit-tested without Konva.
 */

const EPSILON = 1e-6;

/** Builds a straight vertical chain centered on (0, 0), one joint per segment length. */
export function createStraightChain(lengthCm: number): TunnelPoint[] {
    const segmentCount = Math.max(1, Math.round(lengthCm / TUNNEL_SEGMENT_LENGTH));
    const half = (segmentCount * TUNNEL_SEGMENT_LENGTH) / 2;

    return Array.from({ length: segmentCount + 1 }, (_, i) => ({
        x: 0,
        y: -half + i * TUNNEL_SEGMENT_LENGTH,
    }));
}

/** Chebyshev-free vector helpers. */
const subtract = (a: TunnelPoint, b: TunnelPoint): TunnelPoint => ({ x: a.x - b.x, y: a.y - b.y });
const add = (a: TunnelPoint, b: TunnelPoint): TunnelPoint => ({ x: a.x + b.x, y: a.y + b.y });
const scale = (a: TunnelPoint, k: number): TunnelPoint => ({ x: a.x * k, y: a.y * k });

/** Unit vector of `v`, or null when the vector is degenerate. */
function normalize(v: TunnelPoint): TunnelPoint | null {
    const length = Math.hypot(v.x, v.y);

    if (length < EPSILON) return null;

    return { x: v.x / length, y: v.y / length };
}

/**
 * Rotates `direction` so it stays within `maxBendRad` of `reference`
 * (clockwise rotation when the direction is clockwise from the reference,
 * counter-clockwise otherwise, in the y-down screen frame).
 */
function clampDirection(direction: TunnelPoint, reference: TunnelPoint, maxBendRad: number): TunnelPoint {
    const dot = Math.min(1, Math.max(-1, direction.x * reference.x + direction.y * reference.y));
    const angle = Math.acos(dot);

    if (angle <= maxBendRad) return direction;

    // Positive cross product means direction is clockwise from reference.
    const cross = direction.x * reference.y - direction.y * reference.x;
    const sin = (cross >= 0 ? 1 : -1) * Math.sin(maxBendRad);
    const cos = Math.cos(maxBendRad);

    return { x: reference.x * cos - reference.y * sin, y: reference.x * sin + reference.y * cos };
}

/**
 * Rope pass: starting from `startIndex` and walking `step` by `step`, each
 * segment keeps exactly one segment length (rope does not stretch nor
 * compress) and its direction is clamped to +/- `maxBendRad` relative to the
 * previous segment, so a pull propagates through the whole chain like a string.
 */
function propagate(joints: TunnelPoint[], startIndex: number, step: number, maxBendRad: number): void {
    let previousDirection: TunnelPoint | null = null;
    let current = startIndex;

    while (current + step >= 0 && current + step < joints.length) {
        const next = current + step;
        let direction = normalize(subtract(joints[next], joints[current]));

        // Degenerate case (tip exactly on the next joint): keep the previous
        // direction, or fall back to the straight default along the walk.
        if (!direction) {
            direction = previousDirection ?? { x: 0, y: step };
        }

        if (previousDirection) {
            direction = clampDirection(direction, previousDirection, maxBendRad);
        }

        joints[next] = add(joints[current], scale(direction, TUNNEL_SEGMENT_LENGTH));
        previousDirection = direction;
        current = next;
    }
}

/** Pin state and motion tuning of the two tunnel ends during an anchor drag. */
export interface TunnelPinOptions {
    pinnedStart?: boolean;
    pinnedEnd?: boolean;
    /**
     * Max travel (cm) of the dragged tip toward the cursor for this call.
     * Capping the tip travel per drag event keeps the pull fluid: the tip
     * smoothly lags behind the cursor instead of snapping the whole chain
     * when the mouse moves fast. Omit (or pass a value >= the distance) to
     * reach the target exactly (used for the settle pass on drag end).
     */
    maxTipStepCm?: number;
}

/**
 * Rope interaction (US-020): dragging one end anchor pulls the whole tunnel
 * like a string - the first segment follows the cursor, pulls the second one,
 * and so on, each segment being clamped to +/- 25 deg relative to the previous
 * one. The other end follows along when free; when it is pinned, the pinned
 * end is authoritative and the dragged tip may land slightly away from the
 * cursor when the two constraints conflict. Dragging a pinned end does nothing.
 * `maxTipStepCm` caps the tip travel per call for a fluid pull.
 *
 * @param joints - current joint chain, in local centimeters
 * @param draggedEnd - which extreme anchor the user is dragging
 * @param target - cursor position for the dragged tip, in local centimeters
 * @param options - current pin state of both ends
 * @returns the new joint chain (input never mutated)
 */
export function dragChainEnd(
    joints: TunnelPoint[],
    draggedEnd: TunnelEnd,
    target: TunnelPoint,
    options: TunnelPinOptions = {},
): TunnelPoint[] {
    const result = joints.map((point) => ({ ...point }));
    const count = result.length;

    if (count < 2) return result;

    const isStart = draggedEnd === 'start';

    // A pinned end cannot be dragged: it stays exactly where it is.
    if (isStart && options.pinnedStart) return result;
    if (!isStart && options.pinnedEnd) return result;

    const tip = isStart ? 0 : count - 1;
    const far = isStart ? count - 1 : 0;
    const step = isStart ? 1 : -1;
    const farPinned = isStart ? options.pinnedEnd : options.pinnedStart;

    // Fluid pull: cap the tip travel toward the cursor per drag event so a
    // fast mouse swing cannot snap the whole chain in a single move.
    let effectiveTarget = target;

    if (options.maxTipStepCm !== undefined) {
        const remaining = normalize(subtract(target, result[tip]));

        if (remaining) {
            const distance = Math.hypot(target.x - result[tip].x, target.y - result[tip].y);

            if (distance > options.maxTipStepCm) {
                effectiveTarget = add(result[tip], scale(remaining, options.maxTipStepCm));
            }
        }
    }

    result[tip] = { ...effectiveTarget };
    propagate(result, tip, step, (TUNNEL_MAX_BEND_DEG * Math.PI) / 180);

    if (farPinned) {
        // Second pass from the pinned end: re-anchors the chain while keeping
        // the segment lengths and the +/- 20 deg clamp.
        result[far] = { ...joints[far] };
        propagate(result, far, -step, (TUNNEL_MAX_BEND_DEG * Math.PI) / 180);
    }

    return result;
}
