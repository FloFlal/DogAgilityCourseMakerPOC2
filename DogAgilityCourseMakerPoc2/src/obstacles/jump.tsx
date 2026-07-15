import { Circle, Group, Line, Rect } from "react-konva"

export const Jump = ({id, ratio, x, y, rotation, barWidth, barThickess, primaryColor, hurdleWidth, hurdleDepth, hurdleThickness, secondaryColor, onClick, onDragEnd, onTransformEnd, onDrag}) => {
    return (
        <Group type="jump" id={id} x={x} y={y} rotation={rotation} onClick={onClick} onTap={onClick} draggable onDragEnd={onDragEnd} onTransformEnd={onTransformEnd} onDragMove={onDrag}>
            {/* background for select and drag */}
            <Rect strokeEnabled={false} fill="#777" opacity={0} y={-(barWidth / 2 / ratio)-(hurdleWidth / ratio)} x={-(hurdleDepth / 2 / ratio)} height={(hurdleWidth + hurdleWidth + barWidth) / ratio} width={hurdleDepth / ratio} />

            <Circle radius={5} offsetX={5} offsetY={5} />
            {/* left hurdle */}
            <Line stroke={secondaryColor} strokeWidth={hurdleThickness / ratio} points={[0, -(hurdleWidth / ratio), 0, 0, -(hurdleDepth / 2 / ratio), 0, (hurdleDepth / 2 / ratio), 0]} y={-(barWidth / 2 / ratio)} />

            {/* bar */}
            <Line stroke={primaryColor} strokeWidth={barThickess / ratio} points={[0, -(barWidth / 2 / ratio), 0, -(barWidth / 5 / ratio)]} />
            <Line stroke={secondaryColor} strokeWidth={barThickess / ratio} points={[0, -(barWidth / 5 / ratio), 0, (barWidth / 5 / ratio)]} />
            <Line stroke={primaryColor} strokeWidth={barThickess / ratio} points={[0, (barWidth / 5 / ratio), 0, (barWidth / 2 / ratio)]} />

            {/* right hurdle */}
            <Line stroke={secondaryColor} strokeWidth={hurdleThickness / ratio} points={[0, (hurdleWidth / ratio), 0, 0, -(hurdleDepth / 2 / ratio), 0, (hurdleDepth / 2 / ratio), 0]} y={(barWidth / 2 / ratio)} />
        </Group>
    )
}