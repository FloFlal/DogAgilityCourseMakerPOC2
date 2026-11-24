import { Group, Rect } from "react-konva"
import type { LongJumpProps } from "../types/obstacleTypes"

/**
 * Long jump: successive boards crossed in a row over an empty take-off area.
 *
 * Geometry: all lengths are divided by the global canvas `ratio`. The
 * `elementCount` boards (FCI: 2 to 4 elements) are spread along the travel
 * axis (X) over `totalDepth` (up to 120 cm for Large, 120 cm by default),
 * evenly spaced with empty gaps so the jumping area stays visible. Each
 * board is drawn as a transverse rectangle `boardDepth` deep and
 * `boardWidth` wide. An invisible rectangle engulfs the obstacle to offer a
 * stable click and drag surface.
 */
export const LongJump: React.FC<LongJumpProps> = ({
  id,
  ratio,
  x,
  y,
  rotation,
  elementCount,
  boardWidth,
  boardDepth,
  totalDepth,
  primaryColor,
  onClick,
  onTap,
  onDragEnd,
  onTransformEnd,
  onDrag,
  draggable = true
}) => {
    const gap = (totalDepth - elementCount * boardDepth) / Math.max(elementCount - 1, 1);
    const startX = -totalDepth / 2;

    return (
        <Group
          type="longJump"
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
            <Rect strokeEnabled={false} fill="#777" opacity={0} x={-(totalDepth / 2 / ratio)} y={-(boardWidth / 2 / ratio)} width={totalDepth / ratio} height={boardWidth / ratio} />

            {/* transverse boards spread over the total depth */}
            {Array.from({ length: elementCount }, (_, i) => (
                <Rect key={i} strokeEnabled={false} fill={primaryColor} x={(startX + i * (boardDepth + gap)) / ratio} y={-(boardWidth / 2 / ratio)} width={boardDepth / ratio} height={boardWidth / ratio} />
            ))}
        </Group>
    )
}
