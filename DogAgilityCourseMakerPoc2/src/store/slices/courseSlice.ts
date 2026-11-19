import type { StateCreator } from 'zustand';
import { exportCourse, importCourse } from '../../services/courseService';
import type { DrawingState } from '../storeTypes';

/**
 * Slice "parcours" : import/export d'un parcours, délégué au service courseService.
 * Le slice ne gère que l'état applicatif (obstacles importés, erreur courante).
 */

export interface CourseSlice {
    importError: string | null;

    exportToJson: () => string;
    importFromJson: (jsonString: string) => { success: boolean; error?: string };
    clearImportError: () => void;
}

export const createCourseSlice: StateCreator<DrawingState, [], [], CourseSlice> = (set, get) => ({
    importError: null,

    exportToJson: (): string => {
        return exportCourse(get().obstacles);
    },

    importFromJson: (jsonString: string): { success: boolean; error?: string } => {
        const result = importCourse(jsonString);

        if (result.success) {
            set({
                obstacles: result.data ?? [],
                selectedId: null,
                importError: null
            });

            return { success: true };
        }

        const errorMessage = result.error ?? 'Failed to import course data';

        set({ importError: errorMessage });

        return { success: false, error: errorMessage };
    },

    clearImportError: (): void => {
        set({ importError: null });
    },
});
