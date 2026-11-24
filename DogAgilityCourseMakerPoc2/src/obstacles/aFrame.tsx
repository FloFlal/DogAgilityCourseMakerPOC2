import { Group, Line, Rect } from "react-konva"
import type { AFrameProps } from "../types/obstacleTypes"

/**
 * A-Frame: two inclined ramps forming a triangle with a common apex.
 *
 * Algorithm: each ramp has an inclined `elementLength` length and a
 * constant height of 170 units; the horizontal projection of a ramp
 * is upDownVisibleLength = sqrt(elementLength² - 170²). The contact zones
 * (`zoneLength`, measured along the ramp and projected by the same
 * factor) sit at the outer (base) ends of each ramp.
 * The apex is marked with a median line and anti-slip slats
 * (vertical marks spaced 25 units apart, drawn symmetrically) dress up
 * ramps and zones. All lengths are divided by `ratio`.
 */
export const AFrame: React.FC<AFrameProps> = ({
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
    const upDownVisibleLength = Math.sqrt(elementLength * elementLength - 170 * 170);
    const ratioVisible = upDownVisibleLength / elementLength;
    const zoneVisibleLength = zoneLength * ratioVisible;
    const slats: number[] = [];
    
    // slats for both zone
    for (let i = (upDownVisibleLength - zoneVisibleLength + 12.5); i < upDownVisibleLength; i += 25) {
        slats.push(i);
        slats.push(-i);
    }
    // slats for both up down
    for (let i = (upDownVisibleLength - zoneVisibleLength - 12.5); i > 0; i -= 25) {
        slats.push(i);
        slats.push(-i);
    }

    return (
        <Group 
          type="aFrame" 
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
            <Rect strokeEnabled={false} fill={secondaryColor} x={-upDownVisibleLength / ratio} y={-(width / 2 / ratio)} width={zoneVisibleLength / ratio} height={width / ratio} />

            {/* 1st upDown main body */}
            <Rect strokeEnabled={false} fill={primaryColor} x={(-upDownVisibleLength + zoneVisibleLength) / ratio} y={-(width / 2 / ratio)} width={(upDownVisibleLength - zoneVisibleLength) / ratio} height={width / ratio} />

            {/* Add middle line */}
            <Line strokeWidth={2} stroke="#333" x={0} y={-(width / 2 / ratio)} points={[0, 0, 0, width / ratio]} />

            {/* 2nd upDown main body */}
            <Rect strokeEnabled={false} fill={primaryColor} x={0} y={-(width / 2 / ratio)} width={(upDownVisibleLength - zoneVisibleLength) / ratio} height={width / ratio} />

            {/* 2nd zone */}
            <Rect strokeEnabled={false} fill={secondaryColor} x={(upDownVisibleLength - zoneVisibleLength) / ratio} y={-(width / 2 / ratio)} width={zoneVisibleLength / ratio} height={width / ratio} />

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
