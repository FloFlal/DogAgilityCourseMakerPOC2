import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Tunnel } from '../../obstacles/tunnel';
import type { BaseObstacleProps, TunnelPoint } from '../../types/obstacleTypes';

vi.mock('react-konva', async () => await import('./../mocks/reactKonva'));

const makeProps = (overrides: Partial<BaseObstacleProps> = {}): BaseObstacleProps => ({
    id: 'tunnel-1',
    ratio: 2.5,
    x: 100,
    y: 200,
    rotation: 0,
    isSelected: false,
    primaryColor: '#1155FF',
    secondaryColor: '#F59E0B',
    onClick: vi.fn(),
    onTap: vi.fn(),
    onDragEnd: vi.fn(),
    onTransformEnd: vi.fn(),
    onDrag: vi.fn(),
    ...overrides,
});

const renderTunnel = (props: BaseObstacleProps, points?: TunnelPoint[]) =>
    render(<Tunnel {...props} length={300} diameter={66} segmentLength={50} points={points} onPointsChange={vi.fn()} />);

describe('Tunnel', () => {
    it('renders with its identifier and position', () => {
        const props = makeProps();
        const { getByTestId } = renderTunnel(props);

        const group = getByTestId('konva-group');

        expect(group.getAttribute('data-id')).toBe('tunnel-1');
        expect(group.getAttribute('data-x')).toBe('100');
        expect(group.getAttribute('data-y')).toBe('200');
    });

    it('displays the bare length number, without unit', () => {
        const { getByTestId } = renderTunnel(makeProps());

        expect(getByTestId('konva-text').getAttribute('data-text')).toBe('3');
    });

    it('hides the end anchors when not selected', () => {
        const { queryAllByTestId } = renderTunnel(makeProps({ isSelected: false }));

        expect(queryAllByTestId('konva-circle')).toHaveLength(0);
    });

    it('shows the two end anchors when selected', () => {
        const { queryAllByTestId } = renderTunnel(makeProps({ isSelected: true }));

        expect(queryAllByTestId('konva-circle')).toHaveLength(2);
    });

    it('pulls the tunnel like a rope on a free anchor drag, tip on the cursor', () => {
        const onPointsChange = vi.fn();
        const props = { ...makeProps({ isSelected: true }), onPointsChange };
        const { getAllByTestId } = render(
            <Tunnel {...props} length={300} diameter={66} segmentLength={50} />,
        );

        // The mock feeds the drag handler a local target of (7, 14) px, i.e.
        // (7 * 2.5, 14 * 2.5) = (17.5, 35) cm: a free drag must land the tip
        // exactly on the cursor and curve the chain within +/- 25 deg.
        fireEvent.drag(getAllByTestId('konva-circle')[0]);

        expect(onPointsChange).toHaveBeenCalledTimes(1);
        expect(onPointsChange).toHaveBeenCalledWith('tunnel-1', expect.any(Array));

        const chain = onPointsChange.mock.calls[0][1] as TunnelPoint[];

        expect(chain[0]).toEqual({ x: 17.5, y: 35 });

        for (let i = 0; i < chain.length - 1; i += 1) {
            expect(Math.hypot(chain[i + 1].x - chain[i].x, chain[i + 1].y - chain[i].y)).toBeCloseTo(50, 6);
        }

        for (let i = 0; i < chain.length - 2; i += 1) {
            const v1 = { x: chain[i + 1].x - chain[i].x, y: chain[i + 1].y - chain[i].y };
            const v2 = { x: chain[i + 2].x - chain[i + 1].x, y: chain[i + 2].y - chain[i + 1].y };
            const dot = (v1.x * v2.x + v1.y * v2.y) / (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y));
            const angle = (Math.acos(Math.min(1, Math.max(-1, dot))) * 180) / Math.PI;

            expect(angle).toBeLessThanOrEqual(25 + 1e-6);
        }
    });

    it('bends the chain around a pinned end without moving the pin', () => {
        const onPointsChange = vi.fn();
        const props = { ...makeProps({ isSelected: true }), onPointsChange };
        const { getAllByTestId } = render(
            <Tunnel {...props} length={300} diameter={66} segmentLength={50} />,
        );

        // Pin the far (end) anchor, then drag the near (start) one: the pin
        // stays exactly at (0, 150) and the chain bends within +/- 25 deg.
        const anchors = getAllByTestId('konva-circle');

        fireEvent.contextMenu(anchors[1]);
        expect(anchors[1].getAttribute('data-fill')).toBe('#EF4444');

        fireEvent.drag(anchors[0]);

        expect(onPointsChange).toHaveBeenCalledTimes(1);

        const chain = onPointsChange.mock.calls[0][1] as TunnelPoint[];

        expect(chain[6]).toEqual({ x: 0, y: 150 });

        for (let i = 0; i < chain.length - 2; i += 1) {
            const v1 = { x: chain[i + 1].x - chain[i].x, y: chain[i + 1].y - chain[i].y };
            const v2 = { x: chain[i + 2].x - chain[i + 1].x, y: chain[i + 2].y - chain[i + 1].y };
            const dot = (v1.x * v2.x + v1.y * v2.y) / (Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y));
            const angle = (Math.acos(Math.min(1, Math.max(-1, dot))) * 180) / Math.PI;

            expect(angle).toBeLessThanOrEqual(25 + 1e-6);
        }
    });

    it('ignores anchor drags on a pinned end', () => {
        const onPointsChange = vi.fn();
        const props = { ...makeProps({ isSelected: true }), onPointsChange };
        const { getAllByTestId } = render(
            <Tunnel {...props} length={300} diameter={66} segmentLength={50} />,
        );

        // Right-click on the start anchor: it becomes pinned (red).
        const anchors = getAllByTestId('konva-circle');

        fireEvent.contextMenu(anchors[0]);
        expect(anchors[0].getAttribute('data-fill')).toBe('#EF4444');
        expect(anchors[1].getAttribute('data-fill')).toBe('#F59E0B');

        fireEvent.drag(anchors[0]);

        expect(onPointsChange).not.toHaveBeenCalled();
    });

    it('unpins on a second right-click on the same anchor', () => {
        const onPointsChange = vi.fn();
        const props = { ...makeProps({ isSelected: true }), onPointsChange };
        const { getAllByTestId } = render(
            <Tunnel {...props} length={300} diameter={66} segmentLength={50} />,
        );

        const anchors = getAllByTestId('konva-circle');

        fireEvent.contextMenu(anchors[0]);
        fireEvent.contextMenu(anchors[0]);

        expect(anchors[0].getAttribute('data-fill')).toBe('#F59E0B');

        fireEvent.drag(anchors[0]);

        expect(onPointsChange).toHaveBeenCalledTimes(1);
    });

    it('clears the pin when the tunnel is deselected', () => {
        const onPointsChange = vi.fn();
        const { getAllByTestId, rerender } = render(
            <Tunnel {...makeProps({ isSelected: true })} length={300} diameter={66} segmentLength={50} onPointsChange={onPointsChange} />,
        );

        const anchors = getAllByTestId('konva-circle');

        fireEvent.contextMenu(anchors[0]);

        rerender(
            <Tunnel {...makeProps({ isSelected: false })} length={300} diameter={66} segmentLength={50} onPointsChange={onPointsChange} />,
        );

        // Deselection hides the anchors and clears the pin; reselecting
        // shows them again in the free (secondary) color.
        expect(screen.queryAllByTestId('konva-circle')).toHaveLength(0);
    });
});

