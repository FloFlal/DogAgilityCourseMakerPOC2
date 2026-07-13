{create} from 'zustand';

export interface Shape {
    id: string;
    type: 'rectangle'|'circle';
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    rotation: number;
}

interface DrawingState {
    shapes: Shape[]
    selectedId: string|null;
    gridSize: number;
    currentColor: string;
    currentShapeType: 'rectangle'|'circle';

    // Actions
    addShape: (x: number, y: number) => void;
    updateShape: (id: string, newAttrs: Partial<Shape>) => void;
    deleteShape: (id: string) => void;
    setSelectedId: (id: string|null) => void;
    setCurrentColor: (color: string) => void;
    setCurrentShapeType: (type: 'rectangle'|'circle') => void;

    // Import/Export functions
    exportToJson: () => string;
    importFromJson: (jsonString: string) => boolean;
}

export const useDrawingStore =
create<DrawingState> ((set, get) => ({
    shapes: [],
    selefctedId: null,
    gridSize: 10,
    currentColor: '#3b82f6',
    currentShapeType: 'rectangle',

    // Actions
    addShape: (x, y) => {
        const { gridSize, currentColor, currentShapeType } = get();
        // Auto allignment on grid 
        const snappedX = Math.round(x/gridSize) * gridSize;
        const snappedY = Math.round(y/gridSize) * gridSize;

        const newShape: Shape = {
            id: crypto.randomUUID(),
            type: currentShapeType,
            x: snappedX,
            y: snappedY,
            width: gridSize,
            height: gridSize,
            fill: currentColor,
            rotation: 0,
        };

        set((state) => ({ shapes: [...state.shapes, newShape], selectedId: newShape.id}));
    }),

    updateShape: (id, newAttrs) => set((state) => ({
        shapes: state.shapes.map((shape) => {
            if(shape.id !== id) { return shape; }
            
            // if we move the object, optionnaly allign it on the grid
            const updated = {...shape, ...newAttrs};
            if (newAttrs.x !== undefined) {updated.x = Math.round(newAttrs.x/gridSize) * gridSize;}
            if (newAttrs.y !== undefined) {updated.y = Math.round(newAttrs.y/gridSize) * gridSize;}

            return updated;
        })
    })),



    deleteShape: (id) => set((state) => ({
        shapes: state.shapes.filter((shape) => shape.id !== id),
        selectedId: state.selectedId === id ? null : state.selectedId;
    })),

    setSelectedId: (id) => set({selectedId: id}),

    setCurrentColor: (color) => set({currentColor: color}),

    setCurrentShapeType: (type) => set({currentShapeType: type}),

    exportToJson: () => {
        return JSON.stringify(get().shapes, null, 2);
    }

    importFromJson: (jsonString) => {
        try{
            const parsed = JSON.parse(jsonString);
            if (Array.isArray(parsed)) {
                set({ shapes: parsed, selectedId: null });
                return true;
            }
        } catch (e) {
            console.error("Fail to import", e);
            return false;
        }
    }

}))