import type { StateCreator } from 'zustand';
import type { Obstacle } from '../../types/obstacleTypes';
import { OBSTACLE_SIZES, TUNNEL_LENGTHS_BY_TYPE } from '../../constants/canvasDefaults';
import { createStraightChain } from '../../services/tunnelChain';
import type { DrawingState } from '../storeTypes';

/**
 * Drawing slice: obstacle and current selection management.
 */

/** Drawing slice state: placed obstacles, current selection and related actions. */
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
 * Creates the drawing slice: obstacle list, current selection and actions
 * for adding, updating, deleting and selecting.
 * @param set - Zustand state setter
 * @param get - Zustand state getter
 * @returns the drawing slice properties
 */
export const createDrawingSlice: StateCreator<DrawingState, [], [], DrawingSlice> = (set, get) => ({
    obstacles: [],
    selectedId: null,

    // Actions
    addShape: (x: number, y: number): void => {
        const { gridSize, currentColor, currentShapeType } = get();

        // No active tool: clicking the background places nothing.
        if (currentShapeType === null) return;

        // Regulation dimensions per type (canvasDefaults); types
        // without a dedicated component (US-017+) fall back to the grid size.
        const size = OBSTACLE_SIZES[currentShapeType];

        const newShape: Obstacle = {
            id: crypto.randomUUID(),
            type: currentShapeType,
            x: x,
            y: y,
            width: size?.width ?? gridSize,
            height: size?.height ?? gridSize,
            fill: currentColor,
            rotation: 0,
        };

        // Tunnels (US-020): seed the straight joint chain for their regulated
        // length; bending then rewrites this field through the end anchors.
        if (currentShapeType in TUNNEL_LENGTHS_BY_TYPE) {
            newShape.points = createStraightChain(TUNNEL_LENGTHS_BY_TYPE[currentShapeType as keyof typeof TUNNEL_LENGTHS_BY_TYPE]);
        }

        // Placement does not select the obstacle: selection goes through the
        // obstacle click (which also disarms the tool, mutual exclusion).
        set((state) => ({
            obstacles: [...state.obstacles, newShape],
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
        set((state) => ({
            selectedId: id,
            // Selecting an obstacle disarms the placement tool: tool and
            // selection are mutually exclusive.
            currentShapeType: id !== null ? null : state.currentShapeType,
        }));
    },
});
