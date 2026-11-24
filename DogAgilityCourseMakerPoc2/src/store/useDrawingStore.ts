import { create } from 'zustand';
import { logger } from './middleware/logger';
import { createDrawingSlice } from './slices/drawingSlice';
import { createToolSlice } from './slices/toolSlice';
import { createCourseSlice } from './slices/courseSlice';
import type { DrawingState } from './storeTypes';

/**
 * Global Zustand store of the application.
 *
 * Made of three slices to separate responsibilities:
 * - drawingSlice: obstacles and selection (see src/store/slices/drawingSlice.ts)
 * - toolSlice: tool preferences (grid, color, obstacle type)
 * - courseSlice: course import/export via src/services/courseService.ts
 *
 * Mutations are traced in development by the logger middleware
 * (voir src/store/middleware/logger.ts).
 *
 * To avoid unnecessary re-renders, always consume the store through a
 * selector, preferably one of the memoized selectors from src/store/selectors.ts.
 */
export const useDrawingStore = create<DrawingState>()(
    logger((...a) => ({
        ...createDrawingSlice(...a),
        ...createToolSlice(...a),
        ...createCourseSlice(...a),
    })),
);
