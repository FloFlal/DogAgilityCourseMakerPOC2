import { create } from 'zustand';
import { logger } from './middleware/logger';
import { createDrawingSlice } from './slices/drawingSlice';
import { createToolSlice } from './slices/toolSlice';
import { createCourseSlice } from './slices/courseSlice';
import type { DrawingState } from './storeTypes';

/**
 * Store Zustand global de l'application.
 *
 * Composé de trois slices pour séparer les responsabilités :
 * - drawingSlice : obstacles et sélection (voir src/store/slices/drawingSlice.ts)
 * - toolSlice : préférences d'outil (grille, couleur, type d'obstacle)
 * - courseSlice : import/export d'un parcours via src/services/courseService.ts
 *
 * Les mutations sont tracées en développement par le middleware logger
 * (voir src/store/middleware/logger.ts).
 *
 * Pour éviter les re-renders inutiles, toujours consommer le store via un
 * sélecteur, de préférence un des sélecteurs memoized de src/store/selectors.ts.
 */
export const useDrawingStore = create<DrawingState>()(
    logger((...a) => ({
        ...createDrawingSlice(...a),
        ...createToolSlice(...a),
        ...createCourseSlice(...a),
    })),
);
