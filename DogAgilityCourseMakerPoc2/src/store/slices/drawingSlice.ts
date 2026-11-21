import type { StateCreator } from 'zustand';
import type { Obstacle } from '../../types/obstacleTypes';
import type { DrawingState } from '../storeTypes';

/**
 * Slice "dessin" : gestion des obstacles et de la sélection courante.
 */

/** État du slice "dessin" : obstacles posés, sélection courante et actions associées. */
export interface DrawingSlice {
    obstacles: Obstacle[];
    selectedId: string | null;

    // Actions
    addShape: (x: number, y: number) => void;
    updateShape: (id: string, newAttrs: Partial<Obstacle>) => void;
    deleteShape: (id: string) => void;
    setSelectedId: (id: string | null) => void;
}

/**
 * Crée le slice "dessin" : liste d'obstacles, sélection courante et actions
 * d'ajout, de mise à jour, de suppression et de sélection.
 * @param set - mutateur d'état Zustand
 * @param get - accesseur d'état Zustand
 * @returns les propriétés du slice drawing
 */
export const createDrawingSlice: StateCreator<DrawingState, [], [], DrawingSlice> = (set, get) => ({
    obstacles: [],
    selectedId: null,

    // Actions
    addShape: (x: number, y: number): void => {
        const { gridSize, currentColor, currentShapeType } = get();

        const newShape: Obstacle = {
            id: crypto.randomUUID(),
            type: currentShapeType,
            x: x,
            y: y,
            width: gridSize,
            height: gridSize,
            fill: currentColor,
            rotation: 0,
        };

        set((state) => ({
            obstacles: [...state.obstacles, newShape],
            selectedId: newShape.id
        }));
    },

    updateShape: (id: string, newAttrs: Partial<Obstacle>): void => {
        set((state) => ({
            obstacles: state.obstacles.map((shape: Obstacle) => {
                if (shape.id !== id) {
                    return shape;
                }

                const updated: Obstacle = { ...shape, ...newAttrs };

                return updated;
            })
        }));
    },

    deleteShape: (id: string): void => {
        set((state) => ({
            obstacles: state.obstacles.filter((shape: Obstacle) => shape.id !== id),
            selectedId: state.selectedId === id ? null : state.selectedId,
        }));
    },

    setSelectedId: (id: string | null): void => {
        set({ selectedId: id });
    },
});
