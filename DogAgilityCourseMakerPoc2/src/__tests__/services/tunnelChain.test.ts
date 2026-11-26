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
        it('pulls the whole tunnel when dragging along the axis', () => {
            const chain = createStraightChain(300);
            const result = dragChainEnd(chain, 'start', { x: 0, y: -250 });

            // Straight pull = pure translation of the chain.
            expect(result[0]).toEqual({ x: 0, y: -250 });
            expect(result[6].y - result[0].y).toBe(300);
            expect(bendAngles(result).every((angle) => angle < 0.001)).toBe(true);
        });

        it('keeps every segment exactly one segment long', () => {
            const chain = createStraightChain(600);
            const result = dragChainEnd(chain, 'end', { x: 123, y: -321 });

            for (let i = 0; i < result.length - 1; i += 1) {
                const dx = result[i + 1].x - result[i].x;
                const dy = result[i + 1].y - result[i].y;

                expect(Math.hypot(dx, dy)).toBeCloseTo(SEGMENT_LENGTH, 6);
            }
        });

        it('clamps the curvature between consecutive segments to +/- 25 deg', () => {
            const chain = createStraightChain(600);
            // Violent sideways drag: each joint must absorb at most 20 deg.
            const result = dragChainEnd(chain, 'start', { x: 400, y: -250 });
            const bends = bendAngles(result);

            expect(bends.length).toBeGreaterThan(0);
            expect(bends.every((angle) => angle <= MAX_BEND_DEG + 1e-6)).toBe(true);
        });

        it('never mutates the input chain', () => {
            const chain = createStraightChain(300);
            const snapshot = JSON.stringify(chain);

            dragChainEnd(chain, 'start', { x: 250, y: 0 });

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

        it('caps the tip travel per drag event for a fluid pull', () => {
            const chain = createStraightChain(300);
            const result = dragChainEnd(chain, 'start', { x: 300, y: -150 }, { maxTipStepCm: 15 });
            const dx = result[0].x;
            const dy = result[0].y + 150;

            expect(Math.hypot(dx, dy)).toBeCloseTo(15, 6);
        });

        it('reaches the exact target without a step cap', () => {
            const chain = createStraightChain(300);
            const result = dragChainEnd(chain, 'start', { x: 300, y: -150 });

            expect(result[0]).toEqual({ x: 300, y: -150 });
        });

        it('still respects segment lengths and the bend clamp with a pinned end', () => {
            const chain = createStraightChain(600);
            const result = dragChainEnd(chain, 'start', { x: 350, y: -280 }, { pinnedEnd: true });

            expect(result[result.length - 1]).toEqual({ x: 0, y: 300 });

            for (let i = 0; i < result.length - 1; i += 1) {
                const dx = result[i + 1].x - result[i].x;
                const dy = result[i + 1].y - result[i].y;

                expect(Math.hypot(dx, dy)).toBeCloseTo(SEGMENT_LENGTH, 6);
            }

            expect(bendAngles(result).every((angle) => angle <= MAX_BEND_DEG + 1e-6)).toBe(true);
        });
    });
});
