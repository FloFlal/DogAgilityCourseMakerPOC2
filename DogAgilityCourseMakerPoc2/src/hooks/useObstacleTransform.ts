import { useCallback } from 'react';
import { useDrawingStore } from '../store/useDrawingStore';

// Résultat du hook : handler de fin de transformation à invoquer avec l'identifiant de l'obstacle
export type ObstacleTransformHandler = (id: string, x: number, y: number, rotation: number) => void;

/**
 * Hook gérant la logique de transformation des obstacles (rotation/resize) :
 * persiste à la fin de la transformation la position et la rotation dans le store.
 */
export function useObstacleTransform(): ObstacleTransformHandler {
    const updateShape = useDrawingStore((state) => state.updateShape);

    return useCallback((id: string, x: number, y: number, rotation: number): void => {
        updateShape(id, { x, y, rotation });
    }, [updateShape]);
}
