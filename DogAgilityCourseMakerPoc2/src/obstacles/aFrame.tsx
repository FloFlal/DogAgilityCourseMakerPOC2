import { Group, Rect } from "react-konva"

export const AFrame = ({id, ratio, x, y, rotation, width, elementLength, primaryColor, zoneLength, secondaryColor, onClick, onDragEnd, onTransformEnd, onDrag}) => {
    const upDownVisibleLength = Math.sqrt(elementLength*elementLength - 170 * 170);
    const ratioVisible = upDownVisibleLength / elementLength;
    const zoneVisibleLength = zoneLength * ratioVisible;
    return (
        <Group type="aFrame" id={id} x={x} y={y} rotation={rotation} onClick={onClick} onTap={onClick} draggable onDragEnd={onDragEnd} onTransformEnd={onTransformEnd} onDragMove={onDrag}>
            {/* 1st zone */}
            <Rect strokeEnabled={false} fill={secondaryColor} x={-upDownVisibleLength / ratio} y={-(width / 2 / ratio)} width={zoneVisibleLength / ratio} height={width / ratio} />

            {/* 1st upDown main body */}
            <Rect strokeEnabled={false} fill={primaryColor} x={(-upDownVisibleLength + zoneVisibleLength) / ratio} y={-(width / 2 / ratio)} width={(upDownVisibleLength - zoneVisibleLength) / ratio} height={width / ratio} />

            {/* 2nd upDown main body */}
            <Rect strokeEnabled={false} fill={primaryColor} x={0} y={-(width / 2 / ratio)} width={(upDownVisibleLength - zoneVisibleLength) / ratio} height={width / ratio} />

            {/* 2nd zone */}
            <Rect strokeEnabled={false} fill={secondaryColor} x={ (upDownVisibleLength - zoneVisibleLength) / ratio} y={-(width / 2 / ratio)} width={zoneVisibleLength / ratio} height={width / ratio} />

        </Group>
    )
}