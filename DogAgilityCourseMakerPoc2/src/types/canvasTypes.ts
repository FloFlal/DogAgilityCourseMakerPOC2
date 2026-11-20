import type { Obstacle } from './obstacleTypes';

/** Dimensions de la zone de dessin (Stage Konva), en px. */
export interface CanvasDimensions {
  width: number;
  height: number;
}

/** Props de la couche de quadrillage. */
export interface GridLayerProps extends CanvasDimensions {
  gridSize: number;
}

/** Props de la couche d'obstacles : données, sélection et handlers de manipulation. */
export interface ObstaclesLayerProps {
  shapes: Obstacle[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onTransformEnd: (id: string, x: number, y: number, rotation: number) => void;
}

/** Props du composant Transformer : l'identifiant sélectionné (ou null). */
export interface TransformerComponentProps {
  selectedId: string | null;
}
