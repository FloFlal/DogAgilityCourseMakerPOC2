import { createSelector } from './createSelector';
import type { DrawingState } from './storeTypes';
import type { Obstacle } from '../types/obstacleTypes';

/**
 * Sélecteurs du store : à utiliser avec `useDrawingStore(selector)`.
 * Les sélecteurs dérivés sont memoized via createSelector pour éviter
 * les re-renders et les recalculs inutiles.
 */

// Sélecteurs de base (une propriété plate : pas besoin de mémoïsation)
/** Retourne la liste des obstacles du parcours. */
export const selectObstacles = (state: DrawingState): Obstacle[] => state.obstacles;
/** Retourne l'identifiant de l'obstacle sélectionné, ou null si aucun. */
export const selectSelectedId = (state: DrawingState): string | null => state.selectedId;
/** Retourne la taille de la grille (en px) pour le quadrillage et le déplacement clavier. */
export const selectGridSize = (state: DrawingState): number => state.gridSize;
/** Retourne la couleur courante appliquée aux nouveaux obstacles. */
export const selectCurrentColor = (state: DrawingState): string => state.currentColor;
/** Retourne le type d'obstacle courant sélectionné dans la barre d'outils. */
export const selectCurrentShapeType = (state: DrawingState): DrawingState['currentShapeType'] =>
    state.currentShapeType;
/** Retourne l'erreur du dernier import de parcours, ou null si aucune. */
export const selectImportError = (state: DrawingState): string | null => state.importError;

// Donnée dérivée : l'obstacle correspondant à la sélection courante
/**
 * Sélecteur mémoïsé : l'obstacle correspondant à la sélection courante.
 * @param state - l'état du store
 * @returns l'obstacle sélectionné, ou undefined si la sélection est vide
 */
export const selectSelectedObstacle = createSelector(
    selectObstacles,
    selectSelectedId,
    (obstacles, selectedId): Obstacle | undefined =>
        selectedId === null ? undefined : obstacles.find((obstacle) => obstacle.id === selectedId),
);

// Donnée dérivée : l'obstacle correspondant à l'identifiant donné
/**
 * Fabrique un sélecteur retournant l'obstacle d'identifiant donné.
 * @param id - l'identifiant recherché
 * @returns un sélecteur retournant l'obstacle correspondant, ou undefined
 */
export function selectObstacleById(
    id: string,
): (state: DrawingState) => Obstacle | undefined {
    return (state: DrawingState): Obstacle | undefined =>
        state.obstacles.find((obstacle) => obstacle.id === id);
}

// Donnée dérivée : le nombre d'obstacles du parcours
/** Retourne le nombre d'obstacles du parcours. */
export const selectObstacleCount = (state: DrawingState): number => state.obstacles.length;

// Donnée dérivée : un obstacle est-il sélectionné
/**
 * Sélecteur mémoïsé : indique si un obstacle est sélectionné.
 * @param state - l'état du store
 * @returns true si un obstacle est sélectionné
 */
export const selectHasSelection = createSelector(
    selectSelectedId,
    (selectedId): boolean => selectedId !== null,
);
