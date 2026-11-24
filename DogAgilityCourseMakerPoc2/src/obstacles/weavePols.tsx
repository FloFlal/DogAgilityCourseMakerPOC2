import { Arrow, Circle, Group, Rect } from "react-konva"
import type { WeavePolsProps } from "../types/obstacleTypes"

/**
 * Weave poles: a straight row of poles the dog weaves through.
 *
 * Geometry: all lengths are divided by the global canvas `ratio`. The
 * regulated number of poles (8 to 12, 12 by default) is spread on the
 * vertical axis, evenly spaced from -length/2 to +length/2, the length
 * being (pole count - 1) times `poleSpacing` (regulated 60 cm). At the
 * default ratio (2.5) the nominal 4 cm diameter falls under 2 px wide: a
 * minimum visual radius of 4 cm (Ø 8 cm) keeps it legible on screen.
 * Colors alternate along the row, an arrow beside the first pole marks
 * the entry direction, and an invisible rectangle engulfs the whole row
 * to offer a stable click and drag surface.
 */
export const WeavePols: React.FC<WeavePolsProps> = ({
  id,
  ratio,
  x,
  y,
  rotation,
  poleCount,
  poleSpacing,
  poleDiameter,
  primaryColor,
  secondaryColor,
  onClick,
  onTap,
  onDragEnd,
  onTransformEnd,
  onDrag,
  draggable = true
}) => {
    // Minimum visual radius: the regulated 4 cm diameter is too thin on screen.
    const poleRadius = Math.max(poleDiameter / 2, 4);
    const rowLength = (poleCount - 1) * poleSpacing;
    const halfLength = rowLength / 2;
    // Click and drag surface: full length plus one pole spacing on each
    // side, lateral width of one pole spacing.
    const hitWidth = poleSpacing;
    const hitLength = rowLength + 2 * poleSpacing;
    const arrowOffset = poleRadius / ratio + 8;

    return (
        <Group
          type="weavePols"
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
            <Rect strokeEnabled={false} fill="#777" opacity={0} x={-(hitWidth / 2 / ratio)} y={-(hitLength / 2 / ratio)} width={hitWidth / ratio} height={hitLength / ratio} />

            {/* evenly spaced poles, alternating colors */}
            {Array.from({ length: poleCount }, (_, i) => (
                <Circle key={i} x={0} y={(-halfLength + i * poleSpacing) / ratio} radius={poleRadius / ratio} fill={i % 2 === 0 ? primaryColor : secondaryColor} />
            ))}

            {/* entry arrow beside the first pole */}
            <Arrow x={0} y={0} points={[-arrowOffset, -(halfLength / ratio), -arrowOffset, -((halfLength - poleSpacing) / ratio)]} stroke={secondaryColor} pointerLength={5} pointerWidth={3} fill={secondaryColor} />
        </Group>
    )
}
