import type { DrawingSlice } from './slices/drawingSlice';
import type { ToolSlice } from './slices/toolSlice';
import type { CourseSlice } from './slices/courseSlice';

/**
 * État global de l'application : composition des slices
 * dessin (obstacles/sélection), outils (grille/couleur/type) et parcours (import/export).
 */
export type DrawingState = DrawingSlice & ToolSlice & CourseSlice;
