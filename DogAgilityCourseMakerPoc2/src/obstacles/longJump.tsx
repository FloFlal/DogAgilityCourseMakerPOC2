import { Arrow, Group, Rect } from "react-konva"
import type { LongJumpProps } from "../types/obstacleTypes"

/** Step of the progressive board widths: each element is 5 cm wider than the previous one. */
const BOARD_WIDTH_STEP = 5;

/**
 * Long jump: progressive boards crossed in a row over an empty take-off area.
 *
 * Geometry: all lengths are divided by the global canvas `ratio`. The
 * `elementCount` boards (FCI: 2 to 4 elements) are spread along the travel
 * axis (X) over `totalDepth` (up to 120 cm for Large, 120 cm by default),
 * evenly spaced with empty gaps so the jumping area stays visible. Each
 * board is drawn as a transverse rectangle `boardDepth` deep; the widths
 * grow progressively from the narrowest board at take-off to the
 * regulatory `boardWidth` at the last element (5 cm steps, e.g. 105 / 110 /
 * 115 / 120 cm with 4 elements), all centered on the travel axis. Colors
 * alternate between `primaryColor` and `secondaryColor`. A secondary arrow
 * on the side of the obstacle points along the direction of travel. An
 * invisible rectangle engulfs the obstacle to offer a stable click and
 * drag surface.
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
  secondaryColor,
  onClick,
  onTap,
  onDragEnd,
  onTransformEnd,
  onDrag,
  draggable = true
}) => {
    const gap = (totalDepth - elementCount * boardDepth) / Math.max(elementCount - 1, 1);
    const startX = -totalDepth / 2;
    // Progressive widths along the travel direction: the first element is
    // the narrowest, the last one reaches the regulatory boardWidth.
    const boardWidths = Array.from({ length: elementCount }, (_, i) => boardWidth - (elementCount - 1 - i) * BOARD_WIDTH_STEP);

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

            {/* direction arrow on the side of the obstacle (travel direction) */}
            <Arrow x={-(totalDepth / 2 / ratio) - 30} y={0} points={[0, 0, 25, 0]} stroke={secondaryColor} pointerLength={5} pointerWidth={3} fill={secondaryColor} />

            {/* transverse boards spread over the total depth, widths growing to the regulatory width */}
            {boardWidths.map((width, i) => (
                <Rect key={i} strokeEnabled={false} fill={i % 2 === 0 ? primaryColor : secondaryColor} x={(startX + i * (boardDepth + gap)) / ratio} y={-(width / 2 / ratio)} width={boardDepth / ratio} height={width / ratio} />
            ))}
        </Group>
    )
}
