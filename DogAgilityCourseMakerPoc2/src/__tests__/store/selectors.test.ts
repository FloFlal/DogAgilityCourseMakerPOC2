import { describe, expect, it, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import {
    selectObstacles,
    selectSelectedId,
    selectSelectedObstacle,
    selectObstacleById,
    selectObstacleCount,
    selectHasSelection,
} from '../../store/selectors';
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

describe('store selectors', () => {
    beforeEach(() => {
        useDrawingStore.setState({
            obstacles: [makeObstacle('a'), makeObstacle('b')],
            selectedId: 'a',
            importError: null,
        });
    });

    it('selectObstacles et selectSelectedId extraient les champs plats', () => {
        const state = useDrawingStore.getState();

        expect(selectObstacles(state)).toHaveLength(2);
        expect(selectSelectedId(state)).toBe('a');
    });

    it("selectSelectedObstacle retourne l'obstacle sélectionné", () => {
        const selected = selectSelectedObstacle(useDrawingStore.getState());

        expect(selected?.id).toBe('a');
    });

    it('selectSelectedObstacle retourne undefined sans sélection et reste memoized', () => {
        useDrawingStore.setState({ selectedId: null });
        const state = useDrawingStore.getState();

        const first = selectSelectedObstacle(state);
        const second = selectSelectedObstacle(state);

        expect(first).toBeUndefined();
        expect(first).toBe(second);
    });

    it("selectObstacleById retourne l'obstacle correspondant", () => {
        const found = selectObstacleById('b')(useDrawingStore.getState());

        expect(found?.id).toBe('b');
    });

    it('selectObstacleCount compte les obstacles', () => {
        expect(selectObstacleCount(useDrawingStore.getState())).toBe(2);
    });

    it('selectHasSelection reflète la sélection', () => {
        expect(selectHasSelection(useDrawingStore.getState())).toBe(true);

        act(() => {
            useDrawingStore.getState().setSelectedId(null);
        });

        expect(selectHasSelection(useDrawingStore.getState())).toBe(false);
    });
});
