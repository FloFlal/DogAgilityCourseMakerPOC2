import type { StateCreator } from 'zustand';
import type { Obstacle } from '../../types/obstacleTypes';
import type { DrawingState } from '../storeTypes';

/**
 * Slice "dessin" : gestion des obstacles et de la sélection courante.
 */

export interface DrawingSlice {
    obstacles: Obstacle[];
    selectedId: string | null;

    // Actions
    addShape: (x: number, y: number) => void;
    updateShape: (id: string, newAttrs: Partial<Obstacle>) => void;
    deleteShape: (id: string) => void;
    setSelectedId: (id: string | null) => void;
}

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

                // if we move the object, optionally align it on the grid
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
