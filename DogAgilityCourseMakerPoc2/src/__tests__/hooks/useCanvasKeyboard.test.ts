import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCanvasKeyboard } from '../../hooks/useCanvasKeyboard';
import { useDrawingStore } from '../../store/useDrawingStore';
import type { Obstacle } from '../../types/obstacleTypes';

const UUID = '11111111-1111-4111-8111-111111111111';

const makeObstacle = (id: string): Obstacle => ({
    id,
    type: 'jump',
    x: 50,
    y: 60,
    width: 25,
    height: 25,
    fill: '#3b82f6',
    rotation: 0,
});

const pressKey = (init: KeyboardEventInit): void => {
    window.dispatchEvent(new KeyboardEvent('keydown', init));
};

describe('useCanvasKeyboard', () => {
    beforeEach(() => {
        useDrawingStore.setState({
            obstacles: [makeObstacle(UUID)],
            selectedId: UUID,
            gridSize: 25,
            importError: null,
        });
    });

    it("Échap désélectionne l'obstacle sélectionné", () => {
        renderHook(() => useCanvasKeyboard());

        act(() => pressKey({ key: 'Escape' }));

        expect(useDrawingStore.getState().selectedId).toBeNull();
    });

    it("Échap désélectionne l'outil si aucun obstacle n'est sélectionné", () => {
        useDrawingStore.setState({ selectedId: null, currentShapeType: 'jump' });
        renderHook(() => useCanvasKeyboard());

        act(() => pressKey({ key: 'Escape' }));

        expect(useDrawingStore.getState().currentShapeType).toBeNull();
    });

    it("Suppr supprime l'obstacle sélectionné", () => {
        renderHook(() => useCanvasKeyboard());

        act(() => pressKey({ key: 'Delete' }));

        const state = useDrawingStore.getState();

        expect(state.obstacles).toHaveLength(0);
        expect(state.selectedId).toBeNull();
    });

    it("Backspace supprime aussi l'obstacle sélectionné", () => {
        renderHook(() => useCanvasKeyboard());

        act(() => pressKey({ key: 'Backspace' }));

        expect(useDrawingStore.getState().obstacles).toHaveLength(0);
    });

    it("les flèches déplacent l'obstacle d'une case de grille", () => {
        renderHook(() => useCanvasKeyboard());

        act(() => pressKey({ key: 'ArrowRight' }));
        act(() => pressKey({ key: 'ArrowDown' }));

        const moved = useDrawingStore.getState().obstacles[0];

        expect(moved.x).toBe(75);
        expect(moved.y).toBe(85);
    });

    it("Maj + flèche déplace d'un pixel seulement", () => {
        renderHook(() => useCanvasKeyboard());

        act(() => pressKey({ key: 'ArrowLeft', shiftKey: true }));
        act(() => pressKey({ key: 'ArrowUp', shiftKey: true }));

        const moved = useDrawingStore.getState().obstacles[0];

        expect(moved.x).toBe(49);
        expect(moved.y).toBe(59);
    });

    it('ne descend pas en dessous de zéro', () => {
        useDrawingStore.setState({ obstacles: [{ ...makeObstacle(UUID), x: 5, y: 0 }] });

        renderHook(() => useCanvasKeyboard());

        act(() => pressKey({ key: 'ArrowLeft' }));

        const moved = useDrawingStore.getState().obstacles[0];

        expect(moved.x).toBe(0);
        expect(moved.y).toBe(0);
    });

    it('ignore le clavier sans obstacle sélectionné', () => {
        useDrawingStore.setState({ selectedId: null });

        renderHook(() => useCanvasKeyboard());

        act(() => pressKey({ key: 'Delete' }));
        act(() => pressKey({ key: 'ArrowRight' }));

        const state = useDrawingStore.getState();

        expect(state.obstacles).toHaveLength(1);
        expect(state.obstacles[0].x).toBe(50);
    });

    it('ignore le clavier quand le focus est dans un champ de saisie', () => {
        renderHook(() => useCanvasKeyboard());

        const input = document.createElement('input');
        document.body.appendChild(input);

        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));

        expect(useDrawingStore.getState().obstacles).toHaveLength(1);

        input.remove();
    });
});
