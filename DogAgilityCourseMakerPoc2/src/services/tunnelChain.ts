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
 *   lands exactly on the cursor (1:1, no lag), the first segment follows
 *   and pulls the next one, which pulls the next, etc. The tunnel curves
 *   with the mouse movement; a taut pull translates the whole tunnel
 *   without lag;
 * - the grabbed segment reaches toward the first old joint lying at least
 *   one segment length from the cursor: when the cursor crosses the tunnel
 *   body, the rope reconnects BEYOND the crossed joints instead of
 *   hairpinning back to them, which is what made it flip and jump;
 * - every pair of consecutive segments bends by at most +/- 25 deg: the
 *   next segment is pulled toward where it was, clamped to the bend limit,
 *   so a saturated junction translates the following elements sideways
 *   instead of swinging them. The bend side of every joint is remembered
 *   from the pre-drag chain (hysteresis): a saturated joint stays on its
 *   boundary instead of flipping to the opposite side;
 * - dragging the free end while the OTHER end is pinned curves the tunnel
 *   like a rope around the pin: same pull pass, then a re-anchor pass from
 *   the pin (the pin is authoritative, the tip may land short of the
 *   cursor). Dragging a pinned end does nothing.
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

/** Pin state of the two tunnel ends during an anchor drag. */
export interface TunnelPinOptions {
    pinnedStart?: boolean;
    pinnedEnd?: boolean;
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
    // cross(direction, reference) = sin(theta(reference) - theta(direction)):
    // positive means direction sits CLOCKWISE from reference, so the minimal
    // clamp rotates reference clockwise too (negative rotation sign); fall
    // back to this geometric side when the chain was straight there.
    const sign = side !== 0 ? side : cross >= 0 ? -1 : 1;
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
 * 0 straight. Only SATURATED bends (at the +/- limit) are remembered: a
 * saturated joint must hold its side (hysteresis, no flip-flopping), while
 * a barely bent joint has room on both sides and must keep following the
 * cursor with the minimal rotation. Used as hysteresis by the pull passes.
 */
function bendSides(joints: TunnelPoint[], maxBendRad: number): number[] {
    const dirs = segmentDirections(joints);
    const sides = new Array<number>(joints.length).fill(0);

    for (let j = 1; j < joints.length - 1; j += 1) {
        const cross = dirs[j - 1].x * dirs[j].y - dirs[j - 1].y * dirs[j].x;
        const dot = Math.min(1, Math.max(-1, dirs[j - 1].x * dirs[j].x + dirs[j - 1].y * dirs[j].y));
        const angle = Math.acos(dot);

        if (angle >= maxBendRad - 1e-6) {
            sides[j] = cross > 0 ? 1 : -1;
        }
    }

    return sides;
}

/**
 * Rope pass: starting from `startIndex` and walking `step` by `step`, each
 * segment keeps exactly one segment length (rope does not stretch nor
 * compress) and its direction is clamped to +/- `maxBendRad` relative to the
 * previous segment, with the bend side remembered in `sides` (index = joint
 * where the pair meets). The FIRST segment uses `firstDirection` when
 * provided (the reoriented rest direction of the grabbed end); the
 * following ones reach toward where they were, so the chain follows its old
 * shape.
 */
function propagate(
    joints: TunnelPoint[],
    startIndex: number,
    step: number,
    sides: number[],
    maxBendRad: number,
    firstDirection?: TunnelPoint,
): void {
    let previousDirection: TunnelPoint | null = null;
    let current = startIndex;

    while (current + step >= 0 && current + step < joints.length) {
        const next = current + step;
        let direction = firstDirection && current === startIndex
            ? firstDirection
            : normalize(subtract(joints[next], joints[current]));

        // Degenerate case (tip exactly on the next joint): keep the previous
        // direction, or fall back to the straight default along the walk.
        if (!direction) {
            direction = previousDirection ?? { x: 0, y: step };
        }

        if (previousDirection) {
            // The bend side is remembered with the chain's own orientation
            // (cross of segment j-1 with segment j at the joint). Walking
            // BACKWARD (step = -1) compares negated directions, whose cross
            // product is invariant, while clampDirection's rotation still
            // produces the opposite cross: the side sign must therefore be
            // flipped on backward walks, otherwise a saturated joint is held
            // on the WRONG boundary and the chain swings across (the jump
            // seen when dragging the far anchor).
            const side = (sides[current] ?? 0) * step;

            direction = clampDirection(direction, previousDirection, maxBendRad, side);
        }

        joints[next] = add(joints[current], scale(direction, TUNNEL_SEGMENT_LENGTH));
        previousDirection = direction;
        current = next;
    }
}

/**
 * Rope interaction (US-020): dragging one end anchor pulls the whole tunnel
 * like a string. The grabbed tip lands exactly on the cursor (1:1, no lag);
 * the grabbed segment follows and pulls the next one, which pulls the next,
 * etc.: the tunnel curves with the mouse movement. Segments keep their
 * length and consecutive segments bend by at most +/- 25 deg, with the bend
 * side held stable (hysteresis) so over-curving resists smoothly and
 * saturated elements slip sideways instead of swinging. The grabbed segment
 * reorients toward the rope mass (see the module doc), so pulling across
 * the tunnel body folds it instead of flipping it. When the opposite end is
 * pinned, the pull is followed by a re-anchor pass from the pin: the pin is
 * authoritative and the dragged tip may land away from the cursor. Dragging
 * a pinned end does nothing.
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

    // Rest orientation of the grabbed segment (pointing into the chain),
    // used as the fallback when no old joint is far enough from the cursor.
    const restDirection = normalize(subtract(joints[tip + step], joints[tip])) ?? { x: 0, y: step };

    // The grabbed segment reaches toward the first old joint lying at least
    // one segment length from the cursor, walking out past the joints the
    // cursor has crossed: the rope reconnects beyond them instead of
    // hairpinning back, so crossing the body folds it smoothly instead of
    // flipping it (the reached-to joint only moves by one bend step at the
    // crossing, so the direction stays continuous).
    let reachIndex = tip + step;

    while (reachIndex + step >= 0 && reachIndex + step < count
        && Math.hypot(joints[reachIndex].x - target.x, joints[reachIndex].y - target.y) < TUNNEL_SEGMENT_LENGTH) {
        reachIndex += step;
    }

    const firstDirection = normalize(subtract(joints[reachIndex], target)) ?? restDirection;

    // Rope pull: the grabbed tip goes exactly to the cursor (1:1, no lag),
    // then the chain follows segment by segment: each next element is pulled
    // and translated along the previous segment direction, clamped to
    // +/- 25 deg with the remembered bend side (hysteresis). The tunnel
    // curves with the mouse movement and saturating joints slip sideways
    // instead of flipping.
    const maxBendRad = (TUNNEL_MAX_BEND_DEG * Math.PI) / 180;
    const sides = bendSides(joints, maxBendRad);
    const result = joints.map((point) => ({ ...point }));

    result[tip] = { ...target };
    propagate(result, tip, step, sides, maxBendRad, firstDirection);

    // With the far end pinned, a second pass re-anchors the chain onto the
    // pin while keeping the segment lengths and the +/- 25 deg clamp.
    if (farPinned) {
        result[far] = { ...joints[far] };
        propagate(result, far, -step, sides, maxBendRad);
    }

    return result;
}
