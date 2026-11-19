import type { StateCreator } from 'zustand';
import type { ObstacleType } from '../../types/obstacleTypes';
import type { DrawingState } from '../storeTypes';

/**
 * Slice "outils" : préférences de l'outil de dessin (grille, couleur, type d'obstacle).
 */

export interface ToolSlice {
    gridSize: number;
    currentColor: string;
    currentShapeType: ObstacleType;

    setCurrentColor: (color: string) => void;
    setCurrentShapeType: (type: ObstacleType) => void;
}

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
