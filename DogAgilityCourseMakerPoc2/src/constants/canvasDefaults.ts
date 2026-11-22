import type { ObstacleType } from '../types/obstacleTypes';

/** Largeur de la sidebar en px (voir App.tsx). */
export const SIDEBAR_WIDTH_PX = 320;

/** Ratio de dessin divisant toutes les longueurs d'obstacles sur le canvas. */
export const OBSTACLE_RATIO = 2.5;

/** Couleurs par défaut du tracé des obstacles sur le canvas. */
export const OBSTACLE_PRIMARY_COLOR = '#1155FF';
/** Couleur secondaire (zones de contact et détails). */
export const OBSTACLE_SECONDARY_COLOR = '#FFFF00';

/** Style visuel du quadrillage. */
export const GRID_STROKE = '#000';
/** Opacité du quadrillage. */
export const GRID_OPACITY = 0.1;

/** Taille minimale (px) autorisée par le Transformer. */
export const MIN_OBSTACLE_SIZE = 10;

/** Dimensions par défaut de la haie (Jump), échelle FCI, exprimées avant ratio. */
export const JUMP_DEFAULTS = { barWidth: 130, barThickness: 5, hurdleWidth: 50, hurdleDepth: 40, hurdleThickness: 10 };

/** Dimensions par défaut de la bascule (Seesaw), échelle FCI, exprimées avant ratio. */
export const SEESAW_DEFAULTS = { width: 30, length: 370, zoneLength: 90 };

/** Dimensions par défaut de la passerelle (DogWalk), échelle FCI, exprimées avant ratio. */
export const DOG_WALK_DEFAULTS = { width: 30, elementLength: 370, zoneLength: 90 };

/** Dimensions par défaut de la palissade (AFrame), échelle FCI, exprimées avant ratio. */
export const A_FRAME_DEFAULTS = { width: 90, elementLength: 270, zoneLength: 106 };

// Longueurs horizontales visibles (projection de la pente) pour les passes
// de longueur : le corps incliné perd sqrt(length² - hauteur²) en px canvas.
const SEESAW_VISIBLE_LENGTH = Math.sqrt(SEESAW_DEFAULTS.length ** 2 - 120 ** 2);
const DOG_WALK_VISIBLE_LENGTH = Math.sqrt(DOG_WALK_DEFAULTS.elementLength ** 2 - 120 ** 2);
const A_FRAME_VISIBLE_LENGTH = Math.sqrt(A_FRAME_DEFAULTS.elementLength ** 2 - 170 ** 2);

/**
 * Encadrant (width × height) de l'obstacle posé au clic, par type,
 * calculé à partir des dims FCI ci-dessus. Les types sans composant
 * dédié (à venir, US-017+) sont absents : ils retombent sur la taille
 * de grille lors de la pose.
 */
export const OBSTACLE_SIZES: { [K in ObstacleType]?: { width: number; height: number } } = {
    jump: { width: JUMP_DEFAULTS.hurdleDepth, height: JUMP_DEFAULTS.barWidth + 2 * JUMP_DEFAULTS.hurdleWidth },
    seesaw: { width: SEESAW_DEFAULTS.width, height: SEESAW_VISIBLE_LENGTH },
    dogWalk: { width: DOG_WALK_DEFAULTS.width, height: DOG_WALK_DEFAULTS.elementLength + DOG_WALK_VISIBLE_LENGTH },
    aFrame: { width: A_FRAME_DEFAULTS.width, height: 2 * A_FRAME_VISIBLE_LENGTH },
};
