import { validateCourseData } from '../schemas/courseSchema';
import type { Obstacle } from '../types/obstacleTypes';

/** Result of a course import: validated data or an error message. */
export interface CourseImportResult {
    success: boolean;
    data?: Obstacle[];
    error?: string;
}

/**
 * Course import/export service.
 * Pure logic, independent of the Zustand store and the UI.
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
 * @returns the validated obstacles on success, otherwise an error message
 */
export function importCourse(jsonString: string): CourseImportResult {
    const result = validateCourseData(jsonString);

    if (result.success && result.data) {
        return { success: true, data: result.data as Obstacle[] };
    }

    return { success: false, error: result.error ?? 'Failed to import course data' };
}
