import { Circle, Group, Rect, Text } from "react-konva"

export const UserBadge = ({id, x, y, name, isSelected, shapeRef, onClick, onDragEnd, onTransformEnd, onDrag}) => {
    return (
        <Group id={id} x={x} y={y} ref={shapeRef} onClick={onClick} onTap={onClick} draggable onDragEnd={onDragEnd} onTransformEnd={onTransformEnd} width={200} height={80} onDragMove={onDrag}>
            <Rect width={180} height={60} fill={isSelected ? "#057FFF" : "#F0F0F0"} stroke={isSelected ? "#007BFF" : "#cccccc"}
                strokeWidth={10} cornerRadius={8} shadowBlur={5} shadowOpacity={0.1} />
            <Circle x={30} y={30} radius={18} fill="#007BFF" />
            <Text x={60} y={24} text={name} fontsize={14} fontFamily="Arial" fill="#333" fontStyle="bold" />
        </Group> 
    )
}