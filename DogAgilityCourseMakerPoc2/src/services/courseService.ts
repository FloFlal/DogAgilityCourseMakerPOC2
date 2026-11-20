import { validateCourseData } from '../schemas/courseSchema';
import type { Obstacle } from '../types/obstacleTypes';

/** Résultat d'un import de parcours : données validées ou message d'erreur. */
export interface CourseImportResult {
    success: boolean;
    data?: Obstacle[];
    error?: string;
}

/**
 * Service d'import/export des parcours.
 * Logique pure, indépendante du store Zustand et de l'UI.
 */

/**
 * Sérialise un parcours en JSON indenté (format .dacm.json).
 * @param obstacles - la liste des obstacles du parcours
 * @returns la chaîne JSON prête à être sauvegardée ou partagée
 */
export function exportCourse(obstacles: Obstacle[]): string {
    return JSON.stringify(obstacles, null, 2);
}

/**
 * Valide et parse un JSON de parcours.
 * @param jsonString - la chaîne JSON à importer
 * @returns les obstacles validés en cas de succès, sinon un message d'erreur
 */
export function importCourse(jsonString: string): CourseImportResult {
    const result = validateCourseData(jsonString);

    if (result.success && result.data) {
        return { success: true, data: result.data as Obstacle[] };
    }

    return { success: false, error: result.error ?? 'Failed to import course data' };
}
