import { create } from 'zustand';
import { ObstacleType, Obstacle } from '../types/obstacleTypes';

interface DrawingState {
    obstacles: Obstacle[];
    selectedId: string | null;
    gridSize: number;
    currentColor: string;
    currentShapeType: ObstacleType;

    // Actions
    addShape: (x: number, y: number) => void;
    updateShape: (id: string, newAttrs: Partial<Obstacle>) => void;
    deleteShape: (id: string) => void;
    setSelectedId: (id: string | null) => void;
    setCurrentColor: (color: string) => void;
    setCurrentShapeType: (type: ObstacleType) => void;

    // Import/Export functions
    exportToJson: () => string;
    importFromJson: (jsonString: string) => boolean;
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
    obstacles: [],
    selectedId: null,
    gridSize: 25,
    currentColor: '#3b82f6',
    currentShapeType: 'jump',

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

    setCurrentColor: (color: string): void => {
        set({ currentColor: color });
    },

    setCurrentShapeType: (type: ObstacleType): void => {
        set({ currentShapeType: type });
    },

    exportToJson: (): string => {
        return JSON.stringify(get().obstacles, null, 2);
    },

    importFromJson: (jsonString: string): boolean => {
        try {
            const parsed = JSON.parse(jsonString);
            if (Array.isArray(parsed)) {
                set({ obstacles: parsed, selectedId: null });
                return true;
            } else {
                return false;
            }
        } catch (e) {
            console.error("Fail to import", e);
            return false;
        }
    },
}));
