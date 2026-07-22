import { create } from 'zustand';
import { ObstacleType, Obstacle } from '../types/obstacleTypes';
import { validateCourseData, ValidCourse } from '../schemas/courseSchema';

interface DrawingState {
    obstacles: Obstacle[];
    selectedId: string | null;
    gridSize: number;
    currentColor: string;
    currentShapeType: ObstacleType;
    importError: string | null;

    // Actions
    addShape: (x: number, y: number) => void;
    updateShape: (id: string, newAttrs: Partial<Obstacle>) => void;
    deleteShape: (id: string) => void;
    setSelectedId: (id: string | null) => void;
    setCurrentColor: (color: string) => void;
    setCurrentShapeType: (type: ObstacleType) => void;
    clearImportError: () => void;

    // Import/Export functions
    exportToJson: () => string;
    importFromJson: (jsonString: string) => { success: boolean; error?: string };
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
    obstacles: [],
    selectedId: null,
    gridSize: 25,
    currentColor: '#3b82f6',
    currentShapeType: 'jump',
    importError: null,

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

    clearImportError: (): void => {
        set({ importError: null });
    },

    exportToJson: (): string => {
        return JSON.stringify(get().obstacles, null, 2);
    },

    importFromJson: (jsonString: string): { success: boolean; error?: string } => {
        const result = validateCourseData(jsonString);
        
        if (result.success && result.data) {
            set({ 
                obstacles: result.data as unknown as Obstacle[], 
                selectedId: null,
                importError: null 
            });
            return { success: true };
        } else {
            const errorMessage = result.error || 'Failed to import course data';
            set({ importError: errorMessage });
            return { success: false, error: errorMessage };
        }
    },
}));
