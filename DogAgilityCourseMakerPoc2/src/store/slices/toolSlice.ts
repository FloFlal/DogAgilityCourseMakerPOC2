import type { StateCreator } from 'zustand';
import type { ObstacleType } from '../../types/obstacleTypes';
import type { DrawingState } from '../storeTypes';

/**
 * Slice "outils" : préférences de l'outil de dessin (grille, couleur, type d'obstacle).
 */

/** État du slice "outils" : préférences de dessin et mutateurs associés. */
export interface ToolSlice {
    gridSize: number;
    currentColor: string;
    currentShapeType: ObstacleType;

    setCurrentColor: (color: string) => void;
    setCurrentShapeType: (type: ObstacleType) => void;
}

/**
 * Crée le slice "outils" : préférences de dessin (taille de grille, couleur
 * courante, type d'obstacle courant) et leurs mutateurs.
 * @param set - mutateur d'état Zustand
 * @returns les propriétés du slice tools
 */
export const createToolSlice: StateCreator<DrawingState, [], [], ToolSlice> = (set) => ({
    gridSize: 25,
    currentColor: '#3b82f6',
    currentShapeType: 'jump',

    setCurrentColor: (color: string): void => {
        set({ currentColor: color });
    },

    setCurrentShapeType: (type: ObstacleType): void => {
        set({ currentShapeType: type });
    },
});
