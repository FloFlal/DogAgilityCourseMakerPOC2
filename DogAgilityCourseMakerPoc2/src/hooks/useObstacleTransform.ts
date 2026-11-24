import { useCallback } from 'react';
import { useDrawingStore } from '../store/useDrawingStore';

/** Transform-end handler: identifier, new position and rotation. */
export type ObstacleTransformHandler = (id: string, x: number, y: number, rotation: number) => void;

/**
 * Hook managing the obstacle transform logic (rotation/resize):
 * persists the position and rotation into the store at the end of the transform.
 */
export function useObstacleTransform(): ObstacleTransformHandler {
    const updateShape = useDrawingStore((state) => state.updateShape);

    return useCallback((id: string, x: number, y: number, rotation: number): void => {
        updateShape(id, { x, y, rotation });
    }, [updateShape]);
}
