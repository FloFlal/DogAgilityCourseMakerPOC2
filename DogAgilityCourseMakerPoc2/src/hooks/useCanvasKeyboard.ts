import { useEffect } from 'react';
import { useDrawingStore } from '../store/useDrawingStore';

// Fine step by default, in px (the Shift key gives the fast step)
const FINE_STEP_PX = 1;

// Arrow-key moves: [dx, dy]
const ARROW_DELTAS: Record<string, [number, number]> = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
};

// Keyboard navigation does not apply to input fields
function isTextEntryTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;

    return (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
    );
}

/**
 * Canvas keyboard navigation:
 * - Escape: deselects the selected obstacle, otherwise deselects
 *   the active placement tool
 * - Delete / Backspace: deletes the selected obstacle
 * - Arrows: fine move of the selected obstacle (one pixel)
 *   (Shift + arrow: fast move of one gridSize cell), clamped to
 *   coords positives
 *
 * Ignored when the focus is inside an input field. The listener is
 * attached to window and read back via getState(): no re-subscription.
 */
export function useCanvasKeyboard(): void {
    useEffect((): (() => void) => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if (isTextEntryTarget(e.target)) return;

            const store = useDrawingStore.getState();
            const { selectedId } = store;

            // Escape deselects the active item: the selected obstacle
            // if any, otherwise the placement tool (mutual exclusion).
            if (e.key === 'Escape') {
                if (selectedId !== null) {
                    store.setSelectedId(null);
                } else if (store.currentShapeType !== null) {
                    store.setCurrentShapeType(null);
                }

                return;
            }

            if (selectedId === null) return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                store.deleteShape(selectedId);

                return;
            }

            const direction = ARROW_DELTAS[e.key];

            if (!direction) return;

            // Fine step by default; Shift moves a whole grid cell.
            const step = e.shiftKey ? store.gridSize : FINE_STEP_PX;
            const obstacle = store.obstacles.find((o) => o.id === selectedId);

            if (!obstacle) return;

            e.preventDefault();
            store.updateShape(selectedId, {
                x: Math.max(0, obstacle.x + direction[0] * step),
                y: Math.max(0, obstacle.y + direction[1] * step),
            });
        };

        window.addEventListener('keydown', handleKeyDown);

        return (): void => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
}
