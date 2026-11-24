import { Fragment } from "react";
import { Circle, Group, Line, Rect } from "react-konva"
import type { OxerProps } from "../types/obstacleTypes"

/**
 * Oxer (double) : two vertical planes crossed in a row, spread apart along
 * the direction of travel.
 *
 * Geometry: all lengths are divided by the global canvas `ratio`. The bars
 * run along the vertical axis (dog travels along X, like the Jump); the
 * entry plane sits at -spread/2 and the back plane at +spread/2, where
 * `spread` is the regulated depth of the double (FCI: 30 to 90 cm, 60 by
 * default). The back plane — cleared by the dog, drawn last — is slightly
 * thicker than the entry plane to show a higher bar. Each plane gets two
 * T-shaped side feet, and an invisible rectangle engulfs both planes to
 * offer a stable click and drag surface.
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
        { offset: -spread / 2, color: primaryColor, thickness: barThickness },
        { offset: spread / 2, color: primaryColor, thickness: barThickness * 1.4 },
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

            {/* center marker of the footprint */}
            <Circle radius={5} offsetX={5} offsetY={5} fill={secondaryColor} opacity={0.6} />

            {planes.map((plane, i) => (
                <Fragment key={i}>
                    {/* bars */}
                    <Line stroke={i === 0 ? primaryColor : secondaryColor} strokeWidth={plane.thickness / ratio} points={[0, -(barWidth / 2 / ratio), 0, barWidth / 2 / ratio]} x={plane.offset / ratio} />

                    {/* side feet */}
                    <Line x={plane.offset / ratio} y={-(barWidth / 2 / ratio)} stroke={secondaryColor} strokeWidth={hurdleThickness / ratio} points={[0, -(hurdleWidth / ratio), 0, 0, -(hurdleDepth / 2 / ratio), 0, (hurdleDepth / 2 / ratio), 0]} />
                    <Line x={plane.offset / ratio} y={barWidth / 2 / ratio} stroke={secondaryColor} strokeWidth={hurdleThickness / ratio} points={[0, hurdleWidth / ratio, 0, 0, -(hurdleDepth / 2 / ratio), 0, (hurdleDepth / 2 / ratio), 0]} />
                </Fragment>
            ))}
        </Group>
    )
}
