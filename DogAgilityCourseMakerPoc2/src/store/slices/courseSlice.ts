import type { StateCreator } from 'zustand';
import { exportCourse, importCourse } from '../../services/courseService';
import { IMPORT_ERROR_CODES } from '../../schemas/courseSchema';
import type { ImportError } from '../../schemas/courseSchema';
import type { DrawingState } from '../storeTypes';

/**
 * Course slice: course import/export, delegated to the courseService service.
 * The slice only manages the application state (imported obstacles, current
 * error). The error is a structured i18n code: the UI translates it.
 */

/**
 * Course slice state: current import error and actions
 * for export, import and error reset.
 */
export interface CourseSlice {
    importError: ImportError | null;

    exportToJson: () => string;
    importFromJson: (jsonString: string) => { success: boolean; error?: ImportError };
    clearImportError: () => void;
}

/**
 * Creates the course slice: course import/export, delegated to the
 * courseService, plus the current import error (structured i18n code).
 * @param set - Zustand state setter
 * @param get - Zustand state getter
 * @returns the course slice properties
 */
export const createCourseSlice: StateCreator<DrawingState, [], [], CourseSlice> = (set, get) => ({
    importError: null,

    exportToJson: (): string => {
        return exportCourse(get().obstacles);
    },

    importFromJson: (jsonString: string): { success: boolean; error?: ImportError } => {
        const result = importCourse(jsonString);

        if (result.success) {
            set({
                obstacles: result.data ?? [],
                selectedId: null,
                importError: null
            });

            return { success: true };
        }

        const error = result.error ?? { code: IMPORT_ERROR_CODES.importFailed };

        set({ importError: error });

        return { success: false, error };
    },

    clearImportError: (): void => {
        set({ importError: null });
    },
});
