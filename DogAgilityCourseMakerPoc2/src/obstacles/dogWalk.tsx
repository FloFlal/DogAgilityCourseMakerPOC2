import { Group, Line, Rect } from "react-konva"
import type { DogWalkProps } from "../types/obstacleTypes"

/**
 * Dog walk (DogWalk): horizontal central plank with a ramp at each end.
 *
 * Algorithm: `elementLength` is the inclined length of each ramp, whose
 * constant height is 120 units; the horizontal projection of a ramp
 * is upDownVisibleLength = sqrt(elementLength² - 120²). The contact zones
 * (`zoneLength`, measured along the ramp) are projected by the same
 * factor and placed at the outer ends. Anti-slip slats
 * (vertical marks spaced 25 units apart, drawn symmetrically)
 * decorate ramps and zones. All lengths are divided by `ratio`.
 */
export const DogWalk: React.FC<DogWalkProps> = ({
  id,
  ratio,
  x,
  y,
  rotation,
  width,
  elementLength,
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
    const upDownVisibleLength = Math.sqrt(elementLength * elementLength - 120 * 120);
    const ratioVisible = upDownVisibleLength / elementLength;
    const zoneVisibleLength = zoneLength * ratioVisible;
    const upDownMainBodyVisibleLength = upDownVisibleLength - zoneVisibleLength;
    
    const slats: number[] = [];
    // slats for both zone
    for (let i = (elementLength / 2 + upDownMainBodyVisibleLength + 12.5); i < (upDownVisibleLength + elementLength / 2); i += 25) {
        slats.push(i);
        slats.push(-i);
    }
    // slats for both up down
    for (let i = (elementLength / 2 + upDownMainBodyVisibleLength - 12.5); i > (elementLength / 2); i -= 25) {
        slats.push(i);
        slats.push(-i);
    }

    return (
        <Group 
          type="dogWalk" 
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
            {/* 1st zone */}
            <Rect strokeEnabled={false} fill={secondaryColor} x={(-upDownVisibleLength - elementLength / 2) / ratio} y={-(width / 2 / ratio)} width={zoneVisibleLength / ratio} height={width / ratio} />

            {/* 1st upDown main body */}
            <Rect strokeEnabled={false} fill={primaryColor} x={(-upDownMainBodyVisibleLength - elementLength / 2) / ratio} y={-(width / 2 / ratio)} width={upDownMainBodyVisibleLength / ratio} height={width / ratio} />

            {/* Add separation line */}
            <Line strokeWidth={2} stroke="#333" x={-elementLength / 2 / ratio} y={-(width / 2 / ratio)} points={[0, 0, 0, width / ratio]} />

            {/* plan element */}
            <Rect strokeEnabled={false} fill={primaryColor} x={-elementLength / 2 / ratio} y={-(width / 2 / ratio)} width={elementLength / ratio} height={width / ratio} />

            {/* Add separation line */}
            <Line strokeWidth={2} stroke="#333" x={elementLength / 2 / ratio} y={-(width / 2 / ratio)} points={[0, 0, 0, width / ratio]} />

            {/* 2nd upDown main body */}
            <Rect strokeEnabled={false} fill={primaryColor} x={elementLength / 2 / ratio} y={-(width / 2 / ratio)} width={upDownMainBodyVisibleLength / ratio} height={width / ratio} />

            {/* 2nd zone */}
            <Rect strokeEnabled={false} fill={secondaryColor} x={(upDownMainBodyVisibleLength + elementLength / 2) / ratio} y={-(width / 2 / ratio)} width={zoneVisibleLength / ratio} height={width / ratio} />

            {/* Add middle line */}
            {slats.map((i: number) => (
                <Line 
                  key={`slat-${i}`}
                  strokeWidth={2} 
                  opacity={0.1} 
                  stroke="#333" 
                  x={i / ratio} 
                  y={-(width / 2 / ratio)} 
                  points={[0, 0, 0, width / ratio]} 
                />
            ))}
        </Group>
    )
}
