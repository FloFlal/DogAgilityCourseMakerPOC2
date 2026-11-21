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
