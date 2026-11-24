import type { StateCreator } from 'zustand';
import type { ObstacleType } from '../../types/obstacleTypes';
import type { DrawingState } from '../storeTypes';

/**
 * Tools slice: drawing tool preferences (grid, color, obstacle type).
 */

/** Tools slice state: drawing preferences and related setters. */
export interface ToolSlice {
    gridSize: number;
    currentColor: string;
    /** Active placement tool: `null` means "no tool" (nothing placed on click). */
    currentShapeType: ObstacleType | null;

    setCurrentColor: (color: string) => void;
    setCurrentShapeType: (type: ObstacleType | null) => void;
}

/**
 * Creates the tools slice: drawing preferences (grid size, obstacle
 * current color, current obstacle type) and their setters.
 * @param set - Zustand state setter
 * @returns the tools slice properties
 */
export const createToolSlice: StateCreator<DrawingState, [], [], ToolSlice> = (set) => ({
    gridSize: 25,
    currentColor: '#3b82f6',
    currentShapeType: 'jump',

    setCurrentColor: (color: string): void => {
        set({ currentColor: color });
    },

    setCurrentShapeType: (type: ObstacleType | null): void => {
        set((state) => ({
            currentShapeType: type,
            // Arming the tool deselects the current obstacle: tool and
            // selection are mutually exclusive.
            selectedId: type !== null ? null : state.selectedId,
        }));
    },
});
