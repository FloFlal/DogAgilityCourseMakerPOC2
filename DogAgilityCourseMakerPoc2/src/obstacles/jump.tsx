import { Circle, Group, Line, Rect } from "react-konva"
import type { JumpProps } from "../types/obstacleTypes"

/**
 * Hurdle (Jump): horizontal bar resting on two uprights.
 *
 * Geometry: all lengths are divided by the global canvas `ratio`.
 * canvas. The bar is centered on the origin and spans vertically from
 * -barWidth/2 to +barWidth/2; the uprights are arranged symmetrically on
 * each side. An invisible rectangle wraps the whole thing to provide
 * stable click and drag surface.
 */
export const Jump: React.FC<JumpProps> = ({
  id,
  ratio,
  x,
  y,
  rotation,
  barWidth,
  barThickness,  // Correction: barThickess -> barThickness
  primaryColor,
  hurdleWidth,
  hurdleDepth,
  hurdleThickness,
  secondaryColor,
  onClick,
  onTap,
  onDragEnd,
  onTransformEnd,
  onDrag,
  draggable = true
}) => {
    return (
        <Group 
          type="jump" 
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
            {/* background for select and drag */}
            <Rect strokeEnabled={false} fill="#777" opacity={0} y={-(barWidth / 2 / ratio)-(hurdleWidth / ratio)} x={-(hurdleDepth / 2 / ratio)} height={(hurdleWidth + hurdleWidth + barWidth) / ratio} width={hurdleDepth / ratio} />

            <Circle radius={5} offsetX={5} offsetY={5} />
            {/* left hurdle */}
            <Line stroke={secondaryColor} strokeWidth={hurdleThickness / ratio} points={[0, -(hurdleWidth / ratio), 0, 0, -(hurdleDepth / 2 / ratio), 0, (hurdleDepth / 2 / ratio), 0]} y={-(barWidth / 2 / ratio)} />

            {/* bar */}
            <Line stroke={primaryColor} strokeWidth={barThickness / ratio} points={[0, -(barWidth / 2 / ratio), 0, -(barWidth / 5 / ratio)]} />
            <Line stroke={secondaryColor} strokeWidth={barThickness / ratio} points={[0, -(barWidth / 5 / ratio), 0, (barWidth / 5 / ratio)]} />
            <Line stroke={primaryColor} strokeWidth={barThickness / ratio} points={[0, (barWidth / 5 / ratio), 0, (barWidth / 2 / ratio)]} />

            {/* right hurdle */}
            <Line stroke={secondaryColor} strokeWidth={hurdleThickness / ratio} points={[0, (hurdleWidth / ratio), 0, 0, -(hurdleDepth / 2 / ratio), 0, (hurdleDepth / 2 / ratio), 0]} y={(barWidth / 2 / ratio)} />
        </Group>
    )
}
