import Konva from 'konva';

// Types pour les obstacles d'agility selon la réglementation FCI
export type ObstacleType = 
  | 'jump'           // Saut simple
  | 'oxer'          // Saut double
  | 'seesaw'        // Bascule
  | 'dogWalk'       // Passerelle
  | 'aFrame'        // A-frame (mur)
  | 'weavePols'     // Slalom (avec piquets)
  | 'semiWeavePols' // Semi-slalom
  | 'tunnel6m'      // Tunnel 6m
  | 'tunnel5m'      // Tunnel 5m
  | 'tunnel4m'      // Tunnel 4m
  | 'tunnel3m'      // Tunnel 3m
  | 'longJump'      // Saut en longueur
  | 'tire';         // Pneu

// Interface de base pour un obstacle
export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  rotation: number;
}

// Types pour les événements Konva
export type KonvaMouseEvent = Konva.KonvaEventObject<MouseEvent>;
export type KonvaTapEvent = Konva.KonvaEventObject<TouchEvent>;
export type KonvaDragEvent = Konva.KonvaEventObject<DragEvent>;
export type KonvaTransformEvent = Konva.KonvaEventObject<Event>;

// Props communes à tous les composants d'obstacles
export interface BaseObstacleProps {
  id: string;
  ratio: number;
  x: number;
  y: number;
  rotation: number;
  fill?: string;
  primaryColor: string;
  secondaryColor: string;
  isSelected: boolean;
  onClick: (e: KonvaMouseEvent) => void;
  onTap: (e: KonvaTapEvent) => void;
  onDragEnd: (e: KonvaDragEvent) => void;
  onTransformEnd: (e: KonvaTransformEvent) => void;
  onDrag: (e: KonvaDragEvent) => void;
  draggable?: boolean;
}

// Props spécifiques pour le Jump (saut)
export interface JumpProps extends BaseObstacleProps {
  barWidth: number;
  barThickness: number;  // Correction: barThickess -> barThickness
  hurdleWidth: number;
  hurdleDepth: number;
  hurdleThickness: number;
}

// Props spécifiques pour l'A-Frame
export interface AFrameProps extends BaseObstacleProps {
  width: number;
  elementLength: number;
  zoneLength: number;
}

// Props spécifiques pour le Seesaw (bascule)
export interface SeesawProps extends BaseObstacleProps {
  width: number;
  length: number;
  zoneLength: number;
}

// Props spécifiques pour le DogWalk (passerelle)
export interface DogWalkProps extends BaseObstacleProps {
  width: number;
  elementLength: number;
  zoneLength: number;
}
