import { Group, Line, Rect } from "react-konva"

export const DogWalk = ({id, ratio, x, y, rotation, width, elementLength, primaryColor, zoneLength, secondaryColor, onClick, onDragEnd, onTransformEnd, onDrag}) => {
    const upDownVisibleLength = Math.sqrt(elementLength*elementLength - 120 * 120);
    const ratioVisible = upDownVisibleLength / elementLength;
    const zoneVisibleLength = zoneLength * ratioVisible;
    const upDownMainBodyVisibleLength = upDownVisibleLength - zoneVisibleLength;
    
    let slats:number[] = [];
    // slats for both zone
    for (let i = (elementLength / 2 + upDownMainBodyVisibleLength + 12.5) ; i < (upDownVisibleLength + elementLength / 2) ; i += 25) {
        slats.push(i);
        slats.push(-i);
    }
    // slats for both up down
    for (let i = (elementLength / 2 + upDownMainBodyVisibleLength - 12.5) ; i > (elementLength / 2) ; i -= 25) {
        slats.push(i);
        slats.push(-i);
    }

    return (
        <Group type="seesaw" id={id} x={x} y={y} rotation={rotation} onClick={onClick} onTap={onClick} draggable onDragEnd={onDragEnd} onTransformEnd={onTransformEnd} onDragMove={onDrag}>
            {/* 1st zone */}
            <Rect strokeEnabled={false} fill={secondaryColor} x={(-upDownVisibleLength - elementLength / 2) / ratio} y={-(width / 2 / ratio)} width={zoneVisibleLength / ratio} height={width / ratio} />

            {/* 1st upDown main body */}
            <Rect strokeEnabled={false} fill={primaryColor} x={(-upDownMainBodyVisibleLength - elementLength / 2) / ratio} y={-(width / 2 / ratio)} width={upDownMainBodyVisibleLength / ratio} height={width / ratio} />

            {/* Add separation line */}
            <Line strokeWidth={2} stroke="#333" x={-elementLength / 2 / ratio} y={-(width / 2 / ratio)} points={[0, 0, 0, width / ratio]} />

            {/* plan element */}
            <Rect strokeEnabled={false} fill={primaryColor} x={-elementLength / 2 / ratio} y={-(width / 2 / ratio)} width={elementLength / ratio} height={width / ratio} />
           
            {/* Add separation line */}
            <Line strokeWidth={2} stroke="#333" x={ elementLength / 2 / ratio} y={-(width / 2 / ratio)} points={[0, 0, 0, width / ratio]} />

            {/* 2nd upDown main body */}
            <Rect strokeEnabled={false} fill={primaryColor} x={elementLength / 2 / ratio} y={-(width / 2 / ratio)} width={upDownMainBodyVisibleLength / ratio} height={width / ratio} />

            {/* 2nd zone */}
            <Rect strokeEnabled={false} fill={secondaryColor} x={(upDownMainBodyVisibleLength + elementLength / 2) / ratio} y={-(width / 2 / ratio)} width={zoneVisibleLength / ratio} height={width / ratio} />

            {/* Add middle line */}
            {
                slats.map((i: number) => {
                    return <Line strokeWidth={2} opacity={0.1} stroke="#333" x={i / ratio} y={-(width / 2 / ratio)} points={[0, 0, 0, width / ratio]} />
                })
            }
        </Group>
    )
}