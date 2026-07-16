import {create} from 'zustand';

type ObstacleType = 'jump'|'oxer'|'seesaw'|'dogWalk'|'aFrame'|'weavePols'|'semiWeavePols'|'tunnel6m'|'tunnel5m'|'tunnel4m'|'tunnel3m'|'longJump'|'tire';

export interface Obstacle {
    id: string;
    type: ObstacleType;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    rotation: number;
}

interface DrawingState {
    obstacles: Obstacle[]
    selectedId: string|null;
    gridSize: number;
    currentColor: string;
    currentShapeType: ObstacleType;

    // Actions
    addShape: (x: number, y: number) => void;
    updateShape: (id: string, newAttrs: Partial<Obstacle>) => void;
    deleteShape: (id: string) => void;
    setSelectedId: (id: string|null) => void;
    setCurrentColor: (color: string) => void;
    setCurrentShapeType: (type: ObstacleType) => void;

    // Import/Export functions
    exportToJson: () => string;
    importFromJson: (jsonString: string) => boolean;
}

export const useDrawingStore = create<DrawingState> ((set, get) => ({
    obstacles: [],
    selectedId: null,
    gridSize: 25,
    currentColor: '#3b82f6',
    currentShapeType: 'jump',

    // Actions
    addShape: (x, y) => {
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

        set((state) => ({ obstacles: [...state.obstacles, newShape], selectedId: newShape.id}));
    },

    updateShape: (id, newAttrs) => set((state) => ({
        obstacles: state.obstacles.map((shape) => {
            if(shape.id !== id) { return shape; }
            
            // if we move the object, optionnaly allign it on the grid
            const updated = {...shape, ...newAttrs};

            return updated;
        })
    })),



    deleteShape: (id) => set((state) => ({
        obstacles: state.obstacles.filter((shape) => shape.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId,
    })),

    setSelectedId: (id) => set({selectedId: id}),

    setCurrentColor: (color) => set({currentColor: color}),

    setCurrentShapeType: (type) => set({currentShapeType: type}),

    exportToJson: () => {
        return JSON.stringify(get().obstacles, null, 2);
    },

    importFromJson: (jsonString) => {
        try{
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