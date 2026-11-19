import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useObstacleDrag } from '../../hooks/useObstacleDrag';
import { useDrawingStore } from '../../store/useDrawingStore';
import type { Obstacle } from '../../types/obstacleTypes';

const makeObstacle = (id: string): Obstacle => ({
    id,
    type: 'jump',
    x: 0,
    y: 0,
    width: 25,
    height: 25,
    fill: '#3b82f6',
    rotation: 0,
});

describe('useObstacleDrag', () => {
    beforeEach(() => {
        useDrawingStore.setState({ obstacles: [makeObstacle('obstacle-1')], selectedId: null });
    });

    it("sélectionne l'obstacle au démarrage du drag", () => {
        const { result } = renderHook(() => useObstacleDrag());

        act(() => {
            result.current.onDragStart('obstacle-1');
        });

        expect(useDrawingStore.getState().selectedId).toBe('obstacle-1');
    });

    it("conserve la sélection si l'obstacle est déjà sélectionné", () => {
        useDrawingStore.setState({ selectedId: 'obstacle-1' });

        const { result } = renderHook(() => useObstacleDrag());

        act(() => {
            result.current.onDragStart('obstacle-1');
        });

        expect(useDrawingStore.getState().selectedId).toBe('obstacle-1');
    });

    it('persiste la nouvelle position à la fin du drag', () => {
        const { result } = renderHook(() => useObstacleDrag());

        act(() => {
            result.current.onDragEnd('obstacle-1', 150, 200);
        });

        const updated = useDrawingStore.getState().obstacles.find((o) => o.id === 'obstacle-1');

        expect(updated?.x).toBe(150);
        expect(updated?.y).toBe(200);
    });
});
