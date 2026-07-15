import { Group, Rect } from "react-konva"

export const DogWalk = ({id, ratio, x, y, rotation, width, elementLength, primaryColor, zoneLength, secondaryColor, onClick, onDragEnd, onTransformEnd, onDrag}) => {
    const upDownVisibleLength = Math.sqrt(elementLength*elementLength - 120 * 120);
    const ratioVisible = upDownVisibleLength / elementLength;
    const zoneVisibleLength = zoneLength * ratioVisible;
    const upDownMainBodyVisibleLength = upDownVisibleLength - zoneVisibleLength;
    return (
        <Group type="seesaw" id={id} x={x} y={y} rotation={rotation} onClick={onClick} onTap={onClick} draggable onDragEnd={onDragEnd} onTransformEnd={onTransformEnd} onDragMove={onDrag}>
            {/* 1st zone */}
            <Rect strokeEnabled={false} fill={secondaryColor} x={(-upDownVisibleLength - elementLength / 2) / ratio} y={-(width / 2 / ratio)} width={zoneVisibleLength / ratio} height={width / ratio} />

            {/* 1st upDown main body */}
            <Rect strokeEnabled={false} fill={primaryColor} x={(-upDownMainBodyVisibleLength - elementLength / 2) / ratio} y={-(width / 2 / ratio)} width={upDownMainBodyVisibleLength / ratio} height={width / ratio} />

            {/* plan element */}
            <Rect strokeEnabled={false} fill={primaryColor} x={-elementLength / 2 / ratio} y={-(width / 2 / ratio)} width={elementLength / ratio} height={width / ratio} />
           
            {/* 2nd upDown main body */}
            <Rect strokeEnabled={false} fill={primaryColor} x={elementLength / 2 / ratio} y={-(width / 2 / ratio)} width={upDownMainBodyVisibleLength / ratio} height={width / ratio} />

            {/* 2nd zone */}
            <Rect strokeEnabled={false} fill={secondaryColor} x={(upDownMainBodyVisibleLength + elementLength / 2) / ratio} y={-(width / 2 / ratio)} width={zoneVisibleLength / ratio} height={width / ratio} />

        </Group>
    )
}