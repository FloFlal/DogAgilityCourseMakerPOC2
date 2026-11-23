import { useCallback } from 'react';
import { useDrawingStore } from '../store/useDrawingStore';

/** Drag handlers to invoke with the identifier of the involved obstacle. */
export interface ObstacleDragHandlers {
    handleDragStart: (id: string) => void;
    handleDragEnd: (id: string, x: number, y: number) => void;
}

/**
 * Hook managing the obstacle drag logic:
 * selection of the dragged obstacle and persistence of its new position.
 */
export function useObstacleDrag(): ObstacleDragHandlers {
    const selectedId = useDrawingStore((state) => state.selectedId);
    const setSelectedId = useDrawingStore((state) => state.setSelectedId);
    const updateShape = useDrawingStore((state) => state.updateShape);

    const handleDragStart = useCallback((id: string): void => {
        if (selectedId !== id) {
            setSelectedId(id);
        }
    }, [selectedId, setSelectedId]);

    const handleDragEnd = useCallback((id: string, x: number, y: number): void => {
        updateShape(id, { x, y });
    }, [updateShape]);

    return { handleDragStart, handleDragEnd };
}
