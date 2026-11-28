import type { Obstacle, TunnelPoint } from './obstacleTypes';

/** Drawing area dimensions (Konva Stage), in px. */
export interface CanvasDimensions {
  width: number;
  height: number;
}

/**
 * Grid layer props (US-033): everything is expressed in px canvas.
 * The grid is drawn only inside the field rectangle; the rulers and the
 * dead zone live outside of it.
 */
export interface GridLayerProps {
  /** Field rectangle top-left x (dead zone width). */
  fieldX: number;
  /** Field rectangle top-left y (dead zone height). */
  fieldY: number;
  /** Field rectangle width in px (fieldWidthMeters * METERS_TO_PX). */
  fieldWidth: number;
  /** Field rectangle height in px (fieldLengthMeters * METERS_TO_PX). */
  fieldHeight: number;
  /** Grid cell size in px (cellSizeMeters * METERS_TO_PX). */
  cellPx: number;
}

/** Obstacles layer props: data, selection and manipulation handlers. */
export interface ObstaclesLayerProps {
  shapes: Obstacle[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onTransformEnd: (id: string, x: number, y: number, rotation: number) => void;
  /** Tunnel-only (US-020): persists the new joint chain after an anchor drag. */
  onPointsChange?: (id: string, points: TunnelPoint[]) => void;
}

/** Transformer component props: the selected identifier (or null). */
export interface TransformerComponentProps {
  selectedId: string | null;
}
