import { TUNNEL_MAX_BEND_DEG, TUNNEL_SEGMENT_LENGTH } from '../constants/canvasDefaults';
import type { TunnelEnd, TunnelPoint } from '../types/obstacleTypes';

/**
 * Tunnel chain geometry (US-020): pure helpers for the flexible tube.
 *
 * The tunnel is modeled as a chain of joints (one per ~50 cm segment)
 * expressed in local centimeters (pre-ratio), centered on (0, 0) when
 * created. All computations are pure and framework-free so they can be
 * unit-tested without Konva.
 *
 * Interaction model (validated on #64, refined after on-grid testing):
 * - dragging an end pulls the whole tunnel like a string: the grabbed tip
 *   lands exactly on the cursor (1:1, no lag), the first segment follows the
 *   cursor and pulls the next one, which pulls the next, etc. The tunnel
 *   consequently curves with the mouse movement. When a junction reaches its
 *   limit, the following element is no longer rotated further: it is
 *   translated along the clamped direction, then the next one is pulled the
 *   same way, etc.;
 * - every pair of consecutive segments bends by at most +/- 25 deg. The bend
 *   side of every joint is remembered from the pre-drag chain (hysteresis): a
 *   saturated joint stays on its boundary instead of flipping to the opposite
 *   one, which is what made the tunnel swing wildly when over-curving;
 * - dragging the free end while the OTHER end is pinned curves the tunnel
 *   like a rope around the pin: same pull pass, then a re-anchor pass from
 *   the pin (the pin is authoritative, the tip may land short of the cursor).
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

/** Vector helpers. */
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
 * Rotates `direction` so it stays within `maxBendRad` of `reference`.
 * `side` is the bend orientation remembered from the pre-drag chain
 * (1 clockwise, -1 counter-clockwise, 0 unknown): a saturated joint is held
 * on the remembered side so the pull cannot make it flip to the opposite
 * boundary in one event.
 */
function clampDirection(direction: TunnelPoint, reference: TunnelPoint, maxBendRad: number, side: number): TunnelPoint {
    const dot = Math.min(1, Math.max(-1, direction.x * reference.x + direction.y * reference.y));
    const angle = Math.acos(dot);

    if (angle <= maxBendRad) return direction;

    const cross = direction.x * reference.y - direction.y * reference.x;
    // Positive cross product means direction is clockwise from reference;
    // fall back to the geometric side when the chain was straight there.
    const sign = side !== 0 ? side : cross >= 0 ? 1 : -1;
    const sin = sign * Math.sin(maxBendRad);
    const cos = Math.cos(maxBendRad);

    return { x: reference.x * cos - reference.y * sin, y: reference.x * sin + reference.y * cos };
}

/** Unit direction of every segment (segment k joins joints k and k+1). */
function segmentDirections(joints: TunnelPoint[]): TunnelPoint[] {
    return joints.slice(0, -1).map((joint, i) => normalize(subtract(joints[i + 1], joint)) ?? { x: 0, y: 1 });
}

/**
 * Bend orientation remembered at every interior joint (index = joint index,
 * between segment j-1 and segment j): 1 clockwise, -1 counter-clockwise,
 * 0 straight. Used as hysteresis by the pull passes.
 */
function bendSides(joints: TunnelPoint[]): number[] {
    const dirs = segmentDirections(joints);
    const sides = new Array<number>(joints.length).fill(0);

    for (let j = 1; j < joints.length - 1; j += 1) {
        const cross = dirs[j - 1].x * dirs[j].y - dirs[j - 1].y * dirs[j].x;

        sides[j] = cross > EPSILON ? 1 : cross < -EPSILON ? -1 : 0;
    }

    return sides;
}

/**
 * Rope pass: starting from `startIndex` and walking `step` by `step`, each
 * segment keeps exactly one segment length (rope does not stretch nor
 * compress) and its direction is clamped to +/- `maxBendRad` relative to the
 * previous segment, with the bend side remembered in `sides` (index = joint
 * where the pair meets).
 */
function propagate(joints: TunnelPoint[], startIndex: number, step: number, sides: number[], maxBendRad: number): void {
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
            direction = clampDirection(direction, previousDirection, maxBendRad, sides[current] ?? 0);
        }

        joints[next] = add(joints[current], scale(direction, TUNNEL_SEGMENT_LENGTH));
        previousDirection = direction;
        current = next;
    }
}

/** Pin state of the two tunnel ends during an anchor drag. */
export interface TunnelPinOptions {
    pinnedStart?: boolean;
    pinnedEnd?: boolean;
}

/**
 * Rope interaction (US-020): dragging one end anchor pulls the whole tunnel
 * like a string. The grabbed tip lands exactly on the cursor (1:1, no lag),
 * the first segment follows the cursor and pulls the next one, which pulls
 * the next, etc.: the tunnel curves with the mouse movement. Segments keep
 * their length and consecutive segments bend by at most +/- 25 deg, with the
 * bend side held stable (hysteresis) so over-curving resists smoothly and
 * saturated elements slip sideways instead of swinging. When the opposite
 * end is pinned, the pull is followed by a re-anchor pass from the pin: the
 * pin is authoritative and the dragged tip may land away from the cursor.
 * Dragging a pinned end does nothing.
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
    const count = joints.length;

    if (count < 2) return joints.map((point) => ({ ...point }));

    const isStart = draggedEnd === 'start';

    // A pinned end cannot be dragged: it stays exactly where it is.
    if (isStart && options.pinnedStart) return joints.map((point) => ({ ...point }));
    if (!isStart && options.pinnedEnd) return joints.map((point) => ({ ...point }));

    const tip = isStart ? 0 : count - 1;
    const far = isStart ? count - 1 : 0;
    const step = isStart ? 1 : -1;
    const farPinned = isStart ? options.pinnedEnd : options.pinnedStart;

    // Rope pull: the grabbed tip goes exactly to the cursor (1:1, no lag),
    // then the chain follows segment by segment: each next element is pulled
    // and translated along the previous segment direction, clamped to
    // +/- 25 deg with the remembered bend side (hysteresis). The tunnel
    // curves with the mouse movement and saturating joints slip sideways
    // instead of flipping.
    const sides = bendSides(joints);
    const result = joints.map((point) => ({ ...point }));
    const maxBendRad = (TUNNEL_MAX_BEND_DEG * Math.PI) / 180;

    result[tip] = { ...target };
    propagate(result, tip, step, sides, maxBendRad);

    // With the far end pinned, a second pass re-anchors the chain onto the
    // pin while keeping the segment lengths and the +/- 25 deg clamp.
    if (farPinned) {
        result[far] = { ...joints[far] };
        propagate(result, far, -step, sides, maxBendRad);
    }

    return result;
}
