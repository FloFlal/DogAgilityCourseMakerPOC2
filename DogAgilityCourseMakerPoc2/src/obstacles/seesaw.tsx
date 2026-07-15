import { Group, Rect, Arrow } from "react-konva"

export const Seesaw = ({id, ratio, x, y, rotation, width, length, primaryColor, zoneLength, secondaryColor, onClick, onDragEnd, onTransformEnd, onDrag}) => {
    const visibleLength = Math.sqrt(length*length - 120 * 120);
    const ratioVisible = visibleLength / length;
    const zoneVisibleLength = zoneLength * ratioVisible;
    const mainBodyVisibleLength = visibleLength - zoneVisibleLength - zoneVisibleLength;
    return (
        <Group type="seesaw" id={id} x={x} y={y} rotation={rotation} onClick={onClick} onTap={onClick} draggable onDragEnd={onDragEnd} onTransformEnd={onTransformEnd} onDragMove={onDrag}>
            {/* entering zone */}
            <Rect strokeEnabled={false} fill={secondaryColor} x={-visibleLength / 2 / ratio} y={-(width / 2 / ratio)} width={zoneVisibleLength / ratio} height={width / ratio} />

            {/* main body */}
            <Rect strokeEnabled={false} fill={primaryColor} x={-mainBodyVisibleLength / 2 / ratio} y={-(width / 2 / ratio)} width={mainBodyVisibleLength / ratio} height={width / ratio} />

            {/* output zone */}
            <Rect strokeEnabled={false} fill={secondaryColor} x={mainBodyVisibleLength / 2 / ratio} y={-(width / 2 / ratio)} width={zoneVisibleLength / ratio} height={width / ratio} />
            
            {/* indicating arraw */}
            <Arrow x={0} y={0} points={[-20, 0, 20, 0]} stroke={secondaryColor} pointerLength={5} pointerWidth={3} fill={secondaryColor} />
        </Group>
    )
}