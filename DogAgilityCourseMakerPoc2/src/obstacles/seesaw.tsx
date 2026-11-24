import { Group, Rect, Arrow } from "react-konva"
import type { SeesawProps } from "../types/obstacleTypes"

/**
 * Seesaw: pivoting plank with contact zones at both ends.
 *
 * Algorithm: the regulation `length` is measured along the
 * inclined plank, whose axis height is fixed at 120 units; the length
 * horizontally visible is therefore sqrt(length² - 120²). The same
 * (visible / regulation) factor projects the `zoneLength` contact zones,
 * also measured along the plank. The plank is drawn as three
 * segments (entry zone, main body, exit zone) and an arrow
 * indicates the passing direction. All lengths are divided by `ratio`.
 */
export const Seesaw: React.FC<SeesawProps> = ({
  id,
  ratio,
  x,
  y,
  rotation,
  width,
  length,
  primaryColor,
  zoneLength,
  secondaryColor,
  onClick,
  onTap,
  onDragEnd,
  onTransformEnd,
  onDrag,
  draggable = true
}) => {
    const visibleLength = Math.sqrt(length * length - 120 * 120);
    const ratioVisible = visibleLength / length;
    const zoneVisibleLength = zoneLength * ratioVisible;
    const mainBodyVisibleLength = visibleLength - zoneVisibleLength - zoneVisibleLength;
    
    return (
        <Group 
          type="seesaw" 
          id={id} 
          x={x} 
          y={y} 
          rotation={rotation} 
          onClick={onClick} 
          onTap={onTap} 
          draggable={draggable}
          onDragEnd={onDragEnd} 
          onTransformEnd={onTransformEnd} 
          onDragMove={onDrag}
        >
            {/* entering zone */}
            <Rect strokeEnabled={false} fill={secondaryColor} x={-visibleLength / 2 / ratio} y={-(width / 2 / ratio)} width={zoneVisibleLength / ratio} height={width / ratio} />

            {/* main body */}
            <Rect strokeEnabled={false} fill={primaryColor} x={-mainBodyVisibleLength / 2 / ratio} y={-(width / 2 / ratio)} width={mainBodyVisibleLength / ratio} height={width / ratio} />

            {/* output zone */}
            <Rect strokeEnabled={false} fill={secondaryColor} x={mainBodyVisibleLength / 2 / ratio} y={-(width / 2 / ratio)} width={zoneVisibleLength / ratio} height={width / ratio} />
            
            {/* indicating arrow */}
            <Arrow x={0} y={0} points={[-20, 0, 20, 0]} stroke={secondaryColor} pointerLength={5} pointerWidth={3} fill={secondaryColor} />
        </Group>
    )
}
