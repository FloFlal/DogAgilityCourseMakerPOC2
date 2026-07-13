import { Circle, Group, Line, Rect, Arrow } from "react-konva"

export const Seesaw = ({id, ratio, x, y, rotation, width, length, primaryColor, zoneLength, secondaryColor, onClick, onDragEnd, onTransformEnd, onDrag}) => {
    const visibleLength = Math.sqrt(length*length - 120 * 120);
    const ratioVisible = visibleLength / length;
    const zoneVisibleLength = zoneLength * ratioVisible;
    const mainBodyVisibleLength = visibleLength - zoneVisibleLength - zoneVisibleLength;
    return (
        <Group type="seesaw" id={id} x={x} y={y} rotation={rotation} onClick={onClick} onTap={onClick} draggable onDragEnd={onDragEnd} onTransformEnd={onTransformEnd} onDragMove={onDrag}>
            {/* entering zone */}
            <Rect strokeEnabled={false} fill={secondaryColor} x={-(width / 2 / ratio)} y={-visibleLength / 2 / ratio} width={width / ratio} height={zoneVisibleLength / ratio} />

            {/* main body */}
            <Rect strokeEnabled={false} fill={primaryColor} x={-(width / 2 / ratio)} y={-mainBodyVisibleLength / 2 / ratio} width={width / ratio} height={mainBodyVisibleLength / ratio} />

            {/* output zone */}
            <Rect strokeEnabled={false} fill={secondaryColor} x={-(width / 2 / ratio)} y={mainBodyVisibleLength / 2 / ratio} width={width / ratio} height={zoneVisibleLength / ratio} />
            
            {/* indicating arraw */}
            <Arrow x={0} y={0} points={[0, -20, 0, 20]} stroke={secondaryColor}3 pointerLength={5} pointerWidth={3} fill={secondaryColor} />
        </Group>
    )
}