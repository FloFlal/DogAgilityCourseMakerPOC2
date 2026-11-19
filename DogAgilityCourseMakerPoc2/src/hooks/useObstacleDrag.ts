import { useCallback } from 'react';
import { useDrawingStore } from '../store/useDrawingStore';

// Résultat du hook : handlers de drag à invoquer avec l'identifiant de l'obstacle
export interface ObstacleDragHandlers {
    handleDragStart: (id: string) => void;
    handleDragEnd: (id: string, x: number, y: number) => void;
}

/**
 * Hook gérant la logique de déplacement (drag) des obstacles :
 * sélection de l'obstacle draggué et persistance de sa nouvelle position.
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
