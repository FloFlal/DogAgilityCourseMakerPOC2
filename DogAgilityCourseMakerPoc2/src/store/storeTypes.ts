import type { DrawingSlice } from './slices/drawingSlice';
import type { ToolSlice } from './slices/toolSlice';
import type { CourseSlice } from './slices/courseSlice';
import type { FieldSlice } from './slices/fieldSlice';

/**
 * Global application state: slices composition
 * drawing (obstacles/selection), tools (grid/color/type) and course (import/export).
 */
export type DrawingState = DrawingSlice & ToolSlice & FieldSlice & CourseSlice;
