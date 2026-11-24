import type { DrawingSlice } from './slices/drawingSlice';
import type { ToolSlice } from './slices/toolSlice';
import type { CourseSlice } from './slices/courseSlice';

/**
 * Global application state: slices composition
 * drawing (obstacles/selection), tools (grid/color/type) and course (import/export).
 */
export type DrawingState = DrawingSlice & ToolSlice & CourseSlice;
