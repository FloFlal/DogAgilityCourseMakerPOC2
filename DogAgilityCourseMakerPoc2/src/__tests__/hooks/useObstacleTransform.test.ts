import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useObstacleTransform } from '../../hooks/useObstacleTransform';
import { useDrawingStore } from '../../store/useDrawingStore';
import type { Obstacle } from '../../types/obstacleTypes';

const makeObstacle = (id: string): Obstacle => ({
    id,
    type: 'seesaw',
    x: 0,
    y: 0,
    width: 25,
    height: 25,
    fill: '#3b82f6',
    rotation: 0,
});

describe('useObstacleTransform', () => {
    beforeEach(() => {
        useDrawingStore.setState({ obstacles: [makeObstacle('obstacle-1')], selectedId: null });
    });

    it('persiste position et rotation à la fin de la transformation', () => {
        const { result } = renderHook(() => useObstacleTransform());

        act(() => {
            result.current('obstacle-1', 42, 84, 90);
        });

        const updated = useDrawingStore.getState().obstacles.find((o) => o.id === 'obstacle-1');

        expect(updated?.x).toBe(42);
        expect(updated?.y).toBe(84);
        expect(updated?.rotation).toBe(90);
    });

    it('ne modifie pas les autres obstacles', () => {
        useDrawingStore.setState({ obstacles: [makeObstacle('a'), makeObstacle('b')] });

        const { result } = renderHook(() => useObstacleTransform());

        act(() => {
            result.current('a', 10, 20, 45);
        });

        const untouched = useDrawingStore.getState().obstacles.find((o) => o.id === 'b');

        expect(untouched?.x).toBe(0);
        expect(untouched?.rotation).toBe(0);
    });
});
