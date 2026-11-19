import { createSelector } from './createSelector';
import type { DrawingState } from './storeTypes';
import type { Obstacle } from '../types/obstacleTypes';

/**
 * Sélecteurs du store : à utiliser avec `useDrawingStore(selector)`.
 * Les sélecteurs dérivés sont memoized via createSelector pour éviter
 * les re-renders et les recalculs inutiles.
 */

// Sélecteurs de base (une propriété plate : pas besoin de mémoïsation)
export const selectObstacles = (state: DrawingState): Obstacle[] => state.obstacles;
export const selectSelectedId = (state: DrawingState): string | null => state.selectedId;
export const selectGridSize = (state: DrawingState): number => state.gridSize;
export const selectCurrentColor = (state: DrawingState): string => state.currentColor;
export const selectCurrentShapeType = (state: DrawingState): DrawingState['currentShapeType'] =>
    state.currentShapeType;
export const selectImportError = (state: DrawingState): string | null => state.importError;

// Donnée dérivée : l'obstacle correspondant à la sélection courante
export const selectSelectedObstacle = createSelector(
    selectObstacles,
    selectSelectedId,
    (obstacles, selectedId): Obstacle | undefined =>
        selectedId === null ? undefined : obstacles.find((obstacle) => obstacle.id === selectedId),
);

// Donnée dérivée : l'obstacle correspondant à l'identifiant donné
export function selectObstacleById(
    id: string,
): (state: DrawingState) => Obstacle | undefined {
    return (state: DrawingState): Obstacle | undefined =>
        state.obstacles.find((obstacle) => obstacle.id === id);
}

// Donnée dérivée : le nombre d'obstacles du parcours
export const selectObstacleCount = (state: DrawingState): number => state.obstacles.length;

// Donnée dérivée : un obstacle est-il sélectionné
export const selectHasSelection = createSelector(
    selectSelectedId,
    (selectedId): boolean => selectedId !== null,
);
