import { Circle, Group, Line, Rect } from "react-konva"
import type { TireProps } from "../types/obstacleTypes"

/**
 * Tyre jump: a suspended tyre inside a standing frame.
 *
 * Geometry: all lengths are divided by the global canvas `ratio`. The tyre
 * is drawn as a circular ring — stroke only, no fill — so the 60 cm inner
 * opening (regulated) stays readable in top view as the key passage of the
 * obstacle; the ring thickness is the `tireThickness` rim. The standing
 * frame is materialized by two ground bars (top and bottom of the
 * `frameSize` square footprint). An invisible rectangle engulfs the frame
 * to offer a stable click and drag surface.
 */
export const Tire: React.FC<TireProps> = ({
  id,
  ratio,
  x,
  y,
  rotation,
  innerDiameter,
  tireThickness,
  frameSize,
  primaryColor,
  secondaryColor,
  onClick,
  onTap,
  onDragEnd,
  onTransformEnd,
  onDrag,
  draggable = true
}) => {
    const middleRadius = (innerDiameter + tireThickness) / 2;

    return (
        <Group
          type="tire"
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
            <Rect strokeEnabled={false} fill="#777" opacity={0} x={-(frameSize / 2 / ratio)} y={-(frameSize / 2 / ratio)} width={frameSize / ratio} height={frameSize / ratio} />

            {/* ground bars of the standing frame */}
            <Line stroke={secondaryColor} strokeWidth={tireThickness / ratio} points={[-(frameSize / 2 / ratio), -(frameSize / 2 / ratio), frameSize / 2 / ratio, -(frameSize / 2 / ratio)]} />
            <Line stroke={secondaryColor} strokeWidth={tireThickness / ratio} points={[-(frameSize / 2 / ratio), frameSize / 2 / ratio, frameSize / 2 / ratio, frameSize / 2 / ratio]} />

            {/* tyre ring: the inner opening is left empty on purpose */}
            <Circle stroke={primaryColor} strokeWidth={tireThickness / ratio} radius={middleRadius / ratio} fillEnabled={false} />
        </Group>
    )
}
