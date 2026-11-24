import type { StateCreator } from 'zustand';
import { exportCourse, importCourse } from '../../services/courseService';
import type { DrawingState } from '../storeTypes';

/**
 * Course slice: course import/export, delegated to the courseService service.
 * The slice only manages the application state (imported obstacles, current error).
 */

/**
 * Course slice state: current import error and actions
 * for export, import and error reset.
 */
export interface CourseSlice {
    importError: string | null;

    exportToJson: () => string;
    importFromJson: (jsonString: string) => { success: boolean; error?: string };
    clearImportError: () => void;
}

/**
 * Creates the course slice: course import/export, delegated to the
 * courseService, plus the current import error message.
 * @param set - Zustand state setter
 * @param get - Zustand state getter
 * @returns the course slice properties
 */
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
