import { createSelector } from './createSelector';
import type { DrawingState } from './storeTypes';
import type { Obstacle } from '../types/obstacleTypes';

/**
 * Store selectors: to be used with `useDrawingStore(selector)`.
 * Derived selectors are memoized via createSelector to avoid
 * unnecessary re-renders and recomputations.
 */

// Base selectors (flat property: no memoization needed)
/** Returns the list of course obstacles. */
export const selectObstacles = (state: DrawingState): Obstacle[] => state.obstacles;
/** Returns the identifier of the selected obstacle, or null when none. */
export const selectSelectedId = (state: DrawingState): string | null => state.selectedId;
/** Returns the grid size (in px) for the grid overlay and keyboard moves. */
export const selectGridSize = (state: DrawingState): number => state.gridSize;
/** Returns the current color applied to new obstacles. */
export const selectCurrentColor = (state: DrawingState): string => state.currentColor;
/** Returns the current obstacle type selected in the toolbar. */
export const selectCurrentShapeType = (state: DrawingState): DrawingState['currentShapeType'] =>
    state.currentShapeType;
/** Returns the last course import error, or null when none. */
export const selectImportError = (state: DrawingState): string | null => state.importError;

// Derived data: the obstacle matching the current selection
/**
 * Memoized selector: the obstacle matching the current selection.
 * @param state - the store state
 * @returns the selected obstacle, or undefined when nothing is selected
 */
export const selectSelectedObstacle = createSelector(
    selectObstacles,
    selectSelectedId,
    (obstacles, selectedId): Obstacle | undefined =>
        selectedId === null ? undefined : obstacles.find((obstacle) => obstacle.id === selectedId),
);

// Derived data: the obstacle matching the given identifier
/**
 * Builds a selector returning the obstacle with the given identifier.
 * @param id - the requested identifier
 * @returns a selector returning the matching obstacle, or undefined
 */
export function selectObstacleById(
    id: string,
): (state: DrawingState) => Obstacle | undefined {
    return (state: DrawingState): Obstacle | undefined =>
        state.obstacles.find((obstacle) => obstacle.id === id);
}

// Derived data: the number of course obstacles
/** Returns the number of course obstacles. */
export const selectObstacleCount = (state: DrawingState): number => state.obstacles.length;

// Derived data: whether an obstacle is selected
/**
 * Memoized selector: whether an obstacle is selected.
 * @param state - the store state
 * @returns true if an obstacle is selected
 */
export const selectHasSelection = createSelector(
    selectSelectedId,
    (selectedId): boolean => selectedId !== null,
);
