import { Fragment } from "react";
import { Arrow, Group, Line, Rect } from "react-konva"
import type { OxerProps } from "../types/obstacleTypes"

/** Extra width of the back bar: the back plane is 20 cm wider than the entry bar. */
const BACK_BAR_EXTRA_WIDTH = 20;

/**
 * Oxer (double) : two vertical planes crossed in a row, spread apart along
 * the direction of travel.
 *
 * Geometry: all lengths are divided by the global canvas `ratio`. The bars
 * run along the vertical axis (dog travels along X, like the Jump); the
 * entry plane sits at -spread/2 and the back plane at +spread/2, where
 * `spread` is the regulated depth of the double (FCI: 30 to 90 cm, 60 by
 * default). The back bar is 20 cm wider than the entry bar and slightly
 * thicker to show the higher plane. Both bars use the striped scheme of
 * the single jump. A secondary arrow on the side of the obstacle points
 * along the direction of travel. Each plane gets two T-shaped side feet,
 * and an invisible rectangle engulfs both planes to offer a stable click
 * and drag surface.
 */
export const Oxer: React.FC<OxerProps> = ({
  id,
  ratio,
  x,
  y,
  rotation,
  barWidth,
  barThickness,
  hurdleWidth,
  hurdleDepth,
  hurdleThickness,
  spread,
  primaryColor,
  secondaryColor,
  onClick,
  onTap,
  onDragEnd,
  onTransformEnd,
  onDrag,
  draggable = true
}) => {
    const planes = [
        { offset: -spread / 2, length: barWidth, thickness: barThickness },
        { offset: spread / 2, length: barWidth + BACK_BAR_EXTRA_WIDTH, thickness: barThickness * 1.4 },
    ];

    return (
        <Group
          type="oxer"
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
            <Rect strokeEnabled={false} fill="#777" opacity={0} x={-(spread + hurdleDepth) / 2 / ratio} y={-(barWidth / 2 / ratio) - hurdleWidth / ratio} width={(spread + hurdleDepth) / ratio} height={(hurdleWidth + hurdleWidth + barWidth) / ratio} />

            {/* direction arrow on the side of the obstacle (travel direction) */}
            <Arrow x={-(spread + hurdleDepth) / 2 / ratio - 30} y={0} points={[0, 0, 25, 0]} stroke={secondaryColor} pointerLength={5} pointerWidth={3} fill={secondaryColor} />

            {planes.map((plane, i) => (
                <Fragment key={i}>
                    {/* striped bar, same scheme as the single jump bar */}
                    <Line stroke={primaryColor} strokeWidth={plane.thickness / ratio} points={[0, -(plane.length / 2 / ratio), 0, -(plane.length / 5 / ratio)]} x={plane.offset / ratio} />
                    <Line stroke={secondaryColor} strokeWidth={plane.thickness / ratio} points={[0, -(plane.length / 5 / ratio), 0, plane.length / 5 / ratio]} x={plane.offset / ratio} />
                    <Line stroke={primaryColor} strokeWidth={plane.thickness / ratio} points={[0, plane.length / 5 / ratio, 0, plane.length / 2 / ratio]} x={plane.offset / ratio} />

                    {/* side feet */}
                    <Line x={plane.offset / ratio} y={-(barWidth / 2 / ratio)} stroke={secondaryColor} strokeWidth={hurdleThickness / ratio} points={[0, -(hurdleWidth / ratio), 0, 0, -(hurdleDepth / 2 / ratio), 0, (hurdleDepth / 2 / ratio), 0]} />
                    <Line x={plane.offset / ratio} y={barWidth / 2 / ratio} stroke={secondaryColor} strokeWidth={hurdleThickness / ratio} points={[0, hurdleWidth / ratio, 0, 0, -(hurdleDepth / 2 / ratio), 0, (hurdleDepth / 2 / ratio), 0]} />
                </Fragment>
            ))}
        </Group>
    )
}
