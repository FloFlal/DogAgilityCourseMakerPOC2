import type { StateCreator } from 'zustand';
import {
    DEFAULT_CELL_SIZE_METERS,
    DEFAULT_FIELD_LENGTH_METERS,
    DEFAULT_FIELD_WIDTH_METERS,
} from '../../constants/canvasDefaults';
import type { DrawingState } from '../storeTypes';

/**
 * Field slice (US-033): physical field (ring) dimensions and grid
 * cell size, both expressed in meters.
 *
 * Scale: 1 m = 100 / OBSTACLE_RATIO px (see METERS_TO_PX in
 * canvasDefaults.ts), the same conversion used by the obstacles.
 *
 * The field dimensions are freely resizable (no upper limit: a training
 * ground can be very small for drills). The cell size is an integer
 * number of meters.
 */

/** Field slice state: field dimensions (meters) and grid cell size, with setters. */
export interface FieldSlice {
    /** Field width (horizontal extent), in meters. Default: 20 m (official ring). */
    fieldWidthMeters: number;
    /** Field length (vertical extent), in meters. Default: 40 m (official ring). */
    fieldLengthMeters: number;
    /** Grid cell size, in whole meters. Default: 1 m. */
    cellSizeMeters: number;

    setFieldWidthMeters: (meters: number) => void;
    setFieldLengthMeters: (meters: number) => void;
    setCellSizeMeters: (meters: number) => void;
}

/**
 * Clamps a dimension to a usable positive integer number of meters:
 * non-finite inputs are ignored (state unchanged), values are rounded
 * and floored at 1 m so the field rectangle always stays drawable.
 * @param meters - raw value coming from the UI input
 * @returns the sanitized integer number of meters (>= 1), or null to keep the current value
 */
function sanitizeMeters(meters: number): number | null {
    if (!Number.isFinite(meters)) return null;

    return Math.max(1, Math.round(meters));
}

/**
 * Creates the field slice: field dimensions and grid cell size (US-033).
 * @param set - Zustand state setter
 * @returns the field slice properties
 */
export const createFieldSlice: StateCreator<DrawingState, [], [], FieldSlice> = (set) => ({
    fieldWidthMeters: DEFAULT_FIELD_WIDTH_METERS,
    fieldLengthMeters: DEFAULT_FIELD_LENGTH_METERS,
    cellSizeMeters: DEFAULT_CELL_SIZE_METERS,

    setFieldWidthMeters: (meters: number): void => {
        const value = sanitizeMeters(meters);
        if (value === null) return;

        set({ fieldWidthMeters: value });
    },

    setFieldLengthMeters: (meters: number): void => {
        const value = sanitizeMeters(meters);
        if (value === null) return;

        set({ fieldLengthMeters: value });
    },

    setCellSizeMeters: (meters: number): void => {
        const value = sanitizeMeters(meters);
        if (value === null) return;

        // The cell size is an integer number of meters (US-033).
        set({ cellSizeMeters: value });
    },
});
