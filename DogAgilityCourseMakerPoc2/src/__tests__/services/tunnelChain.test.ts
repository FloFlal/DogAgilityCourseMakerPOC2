import { describe, expect, it } from 'vitest';
import { createStraightChain, dragChainEnd } from '../../services/tunnelChain';
import type { TunnelPoint } from '../../types/obstacleTypes';

/** Max angular deviation (deg) between two consecutive segments. */
const MAX_BEND_DEG = 25;
const SEGMENT_LENGTH = 50;

function bendAngles(joints: TunnelPoint[]): number[] {
    return joints.slice(2).map((_, i) => {
        const a = joints[i];
        const b = joints[i + 1];
        const c = joints[i + 2];
        const v1 = { x: b.x - a.x, y: b.y - a.y };
        const v2 = { x: c.x - b.x, y: c.y - b.y };
        const dot = (v1.x * v2.x + v1.y * v2.y) / (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y));

        return (Math.acos(Math.min(1, Math.max(-1, dot))) * 180) / Math.PI;
    });
}

function segmentLengths(joints: TunnelPoint[]): number[] {
    return joints.slice(0, -1).map((joint, i) => Math.hypot(joints[i + 1].x - joint.x, joints[i + 1].y - joint.y));
}

function signedBends(joints: TunnelPoint[]): number[] {
    return joints.slice(1, -1).map((_, i) => {
        const v1 = { x: joints[i + 1].x - joints[i].x, y: joints[i + 1].y - joints[i].y };
        const v2 = { x: joints[i + 2].x - joints[i + 1].x, y: joints[i + 2].y - joints[i + 1].y };
        const cross = v1.x * v2.y - v1.y * v2.x;

        return Math.atan2(cross, v1.x * v2.x + v1.y * v2.y);
    });
}

describe('tunnelChain', () => {
    describe('createStraightChain', () => {
        it('builds a vertical chain with one joint per 50 cm segment', () => {
            const chain = createStraightChain(300);

            expect(chain).toHaveLength(7);
            expect(chain.every((point) => point.x === 0)).toBe(true);
            expect(chain[0].y).toBe(-150);
            expect(chain[6].y).toBe(150);
        });

        it('spreads the joints evenly over the regulated length', () => {
            const chain = createStraightChain(600);

            expect(chain).toHaveLength(13);
            expect(chain[1].y - chain[0].y).toBe(SEGMENT_LENGTH);
        });
    });

    describe('dragChainEnd', () => {
        it('translates the whole tunnel 1:1 when dragging a free end', () => {
            const chain = createStraightChain(300);
            const result = dragChainEnd(chain, 'start', { x: 37, y: -80 });
            const dx = 37 - chain[0].x;
            const dy = -80 - chain[0].y;

            // Rigid translation: every joint moves by the exact same delta,
            // so the tip lands exactly on the cursor with zero lag.
            result.forEach((point, i) => {
                expect(point.x).toBeCloseTo(chain[i].x + dx, 6);
                expect(point.y).toBeCloseTo(chain[i].y + dy, 6);
            });
            expect(result[0]).toEqual({ x: 37, y: -80 });
            expect(result[6]).toEqual({ x: 37, y: 220 });
            expect(bendAngles(result).every((angle) => angle < 0.001)).toBe(true);
        });

        it('keeps every segment exactly one segment long on a free drag', () => {
            const chain = createStraightChain(600);
            const result = dragChainEnd(chain, 'end', { x: 123, y: -321 });

            segmentLengths(result).forEach((segmentLength) => {
                expect(segmentLength).toBeCloseTo(SEGMENT_LENGTH, 6);
            });
        });

        it('clamps the curvature to +/- 25 deg around a pinned end', () => {
            const chain = createStraightChain(600);
            // Violent sideways drag with the far end pinned: each joint must
            // absorb at most 25 deg, never swing wildly.
            const result = dragChainEnd(chain, 'start', { x: 400, y: -250 }, { pinnedEnd: true });
            const bends = bendAngles(result);

            expect(bends.length).toBeGreaterThan(0);
            expect(bends.every((angle) => angle <= MAX_BEND_DEG + 1e-6)).toBe(true);
        });

        it('holds the bend side with hysteresis across successive pulls', () => {
            const chain = createStraightChain(600);

            // Two pulls in the same direction: the saturated joints must stay
            // on their boundary side instead of flipping between +25 and -25.
            const firstPull = dragChainEnd(chain, 'start', { x: 400, y: -250 }, { pinnedEnd: true });
            const secondPull = dragChainEnd(firstPull, 'start', { x: 420, y: -280 }, { pinnedEnd: true });
            const bends = signedBends(secondPull);

            expect(bends.length).toBeGreaterThan(0);
            expect(bends.every((angle) => Math.abs(angle) <= (MAX_BEND_DEG * Math.PI) / 180 + 1e-6)).toBe(true);
            expect(bends.every((angle) => angle >= -1e-9 || angle <= 1e-9 ? true : Math.sign(angle) === Math.sign(bends[0]))).toBe(true);
        });

        it('never mutates the input chain', () => {
            const chain = createStraightChain(300);
            const snapshot = JSON.stringify(chain);

            dragChainEnd(chain, 'start', { x: 250, y: 0 }, { pinnedEnd: true });
            dragChainEnd(chain, 'end', { x: -120, y: 40 });

            expect(JSON.stringify(chain)).toBe(snapshot);
        });

        it('keeps a pinned far end exactly in place', () => {
            const chain = createStraightChain(300);
            const pinnedPoint = chain[chain.length - 1];
            const result = dragChainEnd(chain, 'start', { x: 300, y: -150 }, { pinnedEnd: true });

            expect(result[result.length - 1]).toEqual(pinnedPoint);
        });

        it('does not move a pinned end when it is the dragged one', () => {
            const chain = createStraightChain(300);
            const snapshot = JSON.stringify(chain);
            const result = dragChainEnd(chain, 'start', { x: 300, y: -150 }, { pinnedStart: true });

            expect(JSON.stringify(result)).toBe(snapshot);
        });

        it('still respects segment lengths and the bend clamp with a pinned end', () => {
            const chain = createStraightChain(600);
            const result = dragChainEnd(chain, 'start', { x: 350, y: -280 }, { pinnedEnd: true });

            expect(result[result.length - 1]).toEqual({ x: 0, y: 300 });

            segmentLengths(result).forEach((segmentLength) => {
                expect(segmentLength).toBeCloseTo(SEGMENT_LENGTH, 6);
            });

            expect(bendAngles(result).every((angle) => angle <= MAX_BEND_DEG + 1e-6)).toBe(true);
        });
    });
});
