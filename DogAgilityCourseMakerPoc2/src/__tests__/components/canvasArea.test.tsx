import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { CanvasArea } from '../../components/canvasArea';
import { useDrawingStore } from '../../store/useDrawingStore';
import type { Obstacle } from '../../types/obstacleTypes';

vi.mock('react-konva', async () => await import('./../mocks/reactKonva'));

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

describe('CanvasArea', () => {
    beforeEach(() => {
        useDrawingStore.setState({ obstacles: [], selectedId: null });
    });

    it('compose les couches quadrillage, obstacles et transformer', () => {
        useDrawingStore.setState({ obstacles: [makeObstacle('jump-1')] });

        render(<CanvasArea />);

        expect(screen.getByTestId('konva-stage')).toBeTruthy();
        expect(screen.getAllByTestId('konva-layer').length).toBeGreaterThanOrEqual(2);
        expect(screen.getAllByTestId('konva-line').length).toBeGreaterThan(0);
        expect(screen.getByTestId('konva-transformer')).toBeTruthy();
    });

    it('applique le fond clair de la feuille de plan (CANVAS_BACKGROUND)', () => {
        render(<CanvasArea />);

        const zone = screen.getByRole('group');

        expect(zone.style.backgroundColor).toBe('rgb(248, 250, 252)');
    });

    it("rend l'obstacle du store avec son identifiant", () => {
        useDrawingStore.setState({ obstacles: [makeObstacle('jump-42')] });

        render(<CanvasArea />);

        const groups = screen.getAllByTestId('konva-group');

        expect(groups.map((g) => g.getAttribute('data-id'))).toContain('jump-42');
    });

    it("peut ajouter un obstacle via le store", () => {
        render(<CanvasArea />);

        act(() => {
            useDrawingStore.getState().addShape(10, 20);
        });

        expect(useDrawingStore.getState().obstacles).toHaveLength(1);
        // la pose ne sélectionne pas l'obstacle automatiquement
        expect(useDrawingStore.getState().selectedId).toBeNull();
    });

    it("désélectionne l'obstacle via le store", () => {
        useDrawingStore.setState({ obstacles: [makeObstacle('jump-1')], selectedId: 'jump-1' });

        render(<CanvasArea />);

        act(() => {
            useDrawingStore.getState().setSelectedId(null);
        });

        expect(useDrawingStore.getState().selectedId).toBeNull();
    });
});
