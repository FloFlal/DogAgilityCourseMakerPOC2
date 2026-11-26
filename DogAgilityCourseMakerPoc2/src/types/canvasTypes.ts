import type { Obstacle, TunnelPoint } from './obstacleTypes';

/** Drawing area dimensions (Konva Stage), in px. */
export interface CanvasDimensions {
  width: number;
  height: number;
}

/** Grid layer props. */
export interface GridLayerProps extends CanvasDimensions {
  gridSize: number;
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
