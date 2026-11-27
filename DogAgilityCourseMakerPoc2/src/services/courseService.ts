import { validateCourseData, IMPORT_ERROR_CODES } from '../schemas/courseSchema';
import type { ImportError } from '../schemas/courseSchema';
import type { Obstacle } from '../types/obstacleTypes';

/** Result of a course import: validated data or a structured error. */
export interface CourseImportResult {
    success: boolean;
    data?: Obstacle[];
    error?: ImportError;
}

/**
 * Course import/export service.
 * Pure logic, independent of the Zustand store and the UI. Errors are
 * structured i18n codes (translated by the UI), never user-facing strings.
 */

/**
 * Serializes a course into indented JSON (.dacm.json format).
 * @param obstacles - the course obstacle list
 * @returns the JSON string ready to be saved or shared
 */
export function exportCourse(obstacles: Obstacle[]): string {
    return JSON.stringify(obstacles, null, 2);
}

/**
 * Validates and parses a course JSON.
 * @param jsonString - the JSON string to import
 * @returns the validated obstacles on success, otherwise a structured
 *          error (i18n code + optional detailed validation issues)
 */
export function importCourse(jsonString: string): CourseImportResult {
    const result = validateCourseData(jsonString);

    if (result.success && result.data) {
        return { success: true, data: result.data as Obstacle[] };
    }

    return { success: false, error: result.error ?? { code: IMPORT_ERROR_CODES.importFailed } };
}
