import type { Obstacle } from './obstacleTypes';

// Dimensions de la zone de dessin (Stage Konva)
export interface CanvasDimensions {
  width: number;
  height: number;
}

// Props de la couche de quadrillage
export interface GridLayerProps extends CanvasDimensions {
  gridSize: number;
}

// Props de la couche d'obstacles
export interface ObstaclesLayerProps {
  shapes: Obstacle[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onTransformEnd: (id: string, x: number, y: number, rotation: number) => void;
}

// Props du composant Transformer
export interface TransformerComponentProps {
  selectedId: string | null;
}
