import Konva from 'konva';

/**
 * Obstacle types according to the FCI regulations; types not yet
 * drawn yet are reserved for future implementations.
 */
export type ObstacleType = 
  | 'jump'           // Hurdle (single jump)
  | 'oxer'          // Oxer (spread hurdle)
  | 'seesaw'        // Seesaw
  | 'dogWalk'       // Dog walk
  | 'aFrame'        // A-Frame
  | 'weavePols'     // Weave poles (12 poles)
  | 'semiWeavePols' // Semi weave poles (6 poles)
  | 'tunnel6m'      // Tunnel 6m
  | 'tunnel5m'      // Tunnel 5m
  | 'tunnel4m'      // Tunnel 4m
  | 'tunnel3m'      // Tunnel 3m
  | 'longJump'      // Long jump
  | 'tire';         // Tyre

/** Representation of an obstacle placed on the canvas. */
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

/** Alias of Konva events exposed to component handlers. */
export type KonvaMouseEvent = Konva.KonvaEventObject<MouseEvent>;
/** Konva tap (touch) event. */
export type KonvaTapEvent = Konva.KonvaEventObject<TouchEvent>;
/** Konva drag event. */
export type KonvaDragEvent = Konva.KonvaEventObject<DragEvent>;
/** Konva transform (resize/rotation) event. */
export type KonvaTransformEvent = Konva.KonvaEventObject<Event>;

/** Props common to all obstacle components: identity, geometry, colors and handlers. */
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

/** Props specific to the Jump: bar and uprights. */
export interface JumpProps extends BaseObstacleProps {
  barWidth: number;
  barThickness: number;  // Correction: barThickess -> barThickness
  hurdleWidth: number;
  hurdleDepth: number;
  hurdleThickness: number;
}

/** Props specific to the Oxer (double): two jump planes separated by the `spread` depth. */
export interface OxerProps extends BaseObstacleProps {
  barWidth: number;
  barThickness: number;
  hurdleWidth: number;
  hurdleDepth: number;
  hurdleThickness: number;
  spread: number;
}

/** Props specific to the long jump: board count and total depth. */
export interface LongJumpProps extends BaseObstacleProps {
  elementCount: number;
  boardWidth: number;
  boardDepth: number;
  totalDepth: number;
}

/** Props specific to the A-Frame: ramps and contact zones. */
export interface AFrameProps extends BaseObstacleProps {
  width: number;
  elementLength: number;
  zoneLength: number;
}

/** Props specific to the Seesaw: plank and contact zones. */
export interface SeesawProps extends BaseObstacleProps {
  width: number;
  length: number;
  zoneLength: number;
}

/** Props specific to the DogWalk: plank, ramps and contact zones. */
export interface DogWalkProps extends BaseObstacleProps {
  width: number;
  elementLength: number;
  zoneLength: number;
}
