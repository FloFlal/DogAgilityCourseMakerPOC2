import type { ObstacleType } from '../types/obstacleTypes';

/** Sidebar width in px (see App.tsx). */
export const SIDEBAR_WIDTH_PX = 320;

/** Drawing ratio dividing all obstacle lengths on the canvas. */
export const OBSTACLE_RATIO = 2.5;

/** Default drawing colors for obstacles on the canvas. */
export const OBSTACLE_PRIMARY_COLOR = '#1155FF';
/** Secondary color (contact zones and details), readable on the light background. */
export const OBSTACLE_SECONDARY_COLOR = '#F59E0B';

/** Drawing area background: near-white, like a course-plan sheet. */
export const CANVAS_BACKGROUND = '#F8FAFC';

/** Visual style of the grid overlay. */
export const GRID_STROKE = '#000';
/** Grid opacity (dark and visible on the light background). */
export const GRID_OPACITY = 0.3;

/** Minimum size (px) allowed by the Transformer. */
export const MIN_OBSTACLE_SIZE = 10;

/** Default dimensions of the hurdle (Jump), FCI scale, expressed before the ratio. */
export const JUMP_DEFAULTS = { barWidth: 130, barThickness: 5, hurdleWidth: 50, hurdleDepth: 40, hurdleThickness: 10 };

/**
 * Default dimensions of the oxer (double), FCI scale, expressed before the ratio:
 * same structure as the hurdle, with an entry plane and a back plane (the higher
 * one) separated by the `spread` depth (regulated between 30 and 90 cm).
 */
export const OXER_DEFAULTS = {
    barWidth: 130,
    barThickness: 5,
    hurdleWidth: 50,
    hurdleDepth: 40,
    hurdleThickness: 10,
    spread: 60,
};

/**
 * Default dimensions of the long jump, FCI scale, expressed before the ratio:
 * 2 to 4 successive boards spread over a total depth of 120 cm (FCI: 2 to 4
 * elements, total depth up to about 120 cm), each board 120 cm wide. The
 * default is the full Large config with 4 elements.
 */
export const LONG_JUMP_DEFAULTS = { elementCount: 4, boardDepth: 15, boardWidth: 120, totalDepth: 120 };

/**
 * Default dimensions of the tyre, FCI scale, expressed before the ratio:
 * 60 cm inner opening (regulated), 10 cm rim thickness, hung inside a square
 * frame of `frameSize` standing on the ground.
 */
export const TIRE_DEFAULTS = { innerDiameter: 60, tireThickness: 10, frameSize: 100 };

/** Default dimensions of the seesaw (Seesaw), FCI scale, expressed before the ratio. */
export const SEESAW_DEFAULTS = { width: 30, length: 370, zoneLength: 90 };

/** Default dimensions of the dog walk (DogWalk), FCI scale, expressed before the ratio. */
export const DOG_WALK_DEFAULTS = { width: 30, elementLength: 370, zoneLength: 90 };

/** Default dimensions of the A-Frame, FCI scale, expressed before the ratio. */
export const A_FRAME_DEFAULTS = { width: 90, elementLength: 270, zoneLength: 106 };

/** Default dimensions of the weave poles: 12 poles spaced 60 cm, Ø 4 cm, FCI scale, expressed before the ratio. */
export const WEAVE_POLES_DEFAULTS = { poleCount: 12, poleSpacing: 60, poleDiameter: 4 };

/** Default dimensions of the semi weave poles: training-only weave limited to 6 poles, every other weave characteristic kept. */
export const SEMI_WEAVE_POLES_DEFAULTS = { ...WEAVE_POLES_DEFAULTS, poleCount: 6 };

/**
 * Tunnel constants (US-020), FCI scale, expressed before the ratio:
 * regulated 60 cm inner diameter plus a 3 cm wall, chain segments of
 * ~50 cm hinged together, max curvature of +/- 25 deg between two
 * consecutive segments (per-obstacle, no global constraint, raised from
 * 20 deg after on-grid testing). Interaction: dragging a free end moves
 * the whole tunnel (rigid 1:1 translation); curving only happens while
 * the opposite end is pinned (right-click), with a bend-side hysteresis
 * in the rope solve so over-curving resists smoothly instead of jumping.
 */
export const TUNNEL_OUTER_DIAMETER = 60 + 2 * 3;
export const TUNNEL_SEGMENT_LENGTH = 50;
export const TUNNEL_MAX_BEND_DEG = 25;

/** Regulated tunnel length per sub-type (FCI section 4.6: 300 to 600 cm). */
export const TUNNEL_LENGTHS_BY_TYPE: Record<'tunnel6m' | 'tunnel5m' | 'tunnel4m' | 'tunnel3m', number> = {
    tunnel6m: 600,
    tunnel5m: 500,
    tunnel4m: 400,
    tunnel3m: 300,
};

// Visible horizontal lengths (slope projection) for the long
// of length: the inclined body loses sqrt(length² - height²) in canvas px.
const SEESAW_VISIBLE_LENGTH = Math.sqrt(SEESAW_DEFAULTS.length ** 2 - 120 ** 2);
const DOG_WALK_VISIBLE_LENGTH = Math.sqrt(DOG_WALK_DEFAULTS.elementLength ** 2 - 120 ** 2);
const A_FRAME_VISIBLE_LENGTH = Math.sqrt(A_FRAME_DEFAULTS.elementLength ** 2 - 170 ** 2);

/**
 * Bounding box (width x height) of the obstacle placed on click, per type,
 * computed from the FCI dims above. Types without a dedicated
 * (US-017+ onwards) are missing: they fall back to the grid
 * size when placed.
 */
export const OBSTACLE_SIZES: { [K in ObstacleType]?: { width: number; height: number } } = {
    jump: { width: JUMP_DEFAULTS.hurdleDepth, height: JUMP_DEFAULTS.barWidth + 2 * JUMP_DEFAULTS.hurdleWidth },
    oxer: {
        width: OXER_DEFAULTS.spread + OXER_DEFAULTS.hurdleDepth,
        height: OXER_DEFAULTS.barWidth + 2 * OXER_DEFAULTS.hurdleWidth,
    },
    longJump: { width: LONG_JUMP_DEFAULTS.totalDepth, height: LONG_JUMP_DEFAULTS.boardWidth },
    tire: { width: TIRE_DEFAULTS.frameSize, height: TIRE_DEFAULTS.frameSize },
    seesaw: { width: SEESAW_DEFAULTS.width, height: SEESAW_VISIBLE_LENGTH },
    dogWalk: { width: DOG_WALK_DEFAULTS.width, height: DOG_WALK_DEFAULTS.elementLength + DOG_WALK_VISIBLE_LENGTH },
    aFrame: { width: A_FRAME_DEFAULTS.width, height: 2 * A_FRAME_VISIBLE_LENGTH },
    // The lateral width of the weave poles is arbitrary (one pole spacing);
    // only the row length is regulated: (pole count - 1) * spacing.
    weavePols: {
        width: WEAVE_POLES_DEFAULTS.poleSpacing,
        height: (WEAVE_POLES_DEFAULTS.poleCount - 1) * WEAVE_POLES_DEFAULTS.poleSpacing,
    },
    semiWeavePols: {
        width: SEMI_WEAVE_POLES_DEFAULTS.poleSpacing,
        height: (SEMI_WEAVE_POLES_DEFAULTS.poleCount - 1) * SEMI_WEAVE_POLES_DEFAULTS.poleSpacing,
    },
    // Tunnel footprints: outer diameter wide, regulated length long.
    tunnel6m: { width: TUNNEL_OUTER_DIAMETER, height: TUNNEL_LENGTHS_BY_TYPE.tunnel6m },
    tunnel5m: { width: TUNNEL_OUTER_DIAMETER, height: TUNNEL_LENGTHS_BY_TYPE.tunnel5m },
    tunnel4m: { width: TUNNEL_OUTER_DIAMETER, height: TUNNEL_LENGTHS_BY_TYPE.tunnel4m },
    tunnel3m: { width: TUNNEL_OUTER_DIAMETER, height: TUNNEL_LENGTHS_BY_TYPE.tunnel3m },
};
