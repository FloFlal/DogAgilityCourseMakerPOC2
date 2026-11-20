import { Group, Rect, Arrow } from "react-konva"
import type { SeesawProps } from "../types/obstacleTypes"

/**
 * Bascule (Seesaw) : plateau pivotant avec zones de contact aux deux extrémités.
 *
 * Algorithme : la longueur réglementaire `length` est mesurée le long de la
 * piste inclinée, dont la hauteur d'axe est fixée à 120 unités ; la longueur
 * horizontale visible vaut donc sqrt(length² - 120²). Le même coefficient
 * (visible / réglementaire) projette les zones de contact `zoneLength`,
 * elles aussi mesurées le long de la piste. Le plateau est dessiné en trois
 * segments (zone d'entrée, corps principal, zone de sortie) et une flèche
 * indique le sens de passage. Toutes les longueurs sont divisées par `ratio`.
 */
export const Seesaw: React.FC<SeesawProps> = ({
  id,
  ratio,
  x,
  y,
  rotation,
  width,
  length,
  primaryColor,
  zoneLength,
  secondaryColor,
  onClick,
  onTap,
  onDragEnd,
  onTransformEnd,
  onDrag,
  draggable = true
}) => {
    const visibleLength = Math.sqrt(length * length - 120 * 120);
    const ratioVisible = visibleLength / length;
    const zoneVisibleLength = zoneLength * ratioVisible;
    const mainBodyVisibleLength = visibleLength - zoneVisibleLength - zoneVisibleLength;
    
    return (
        <Group 
          type="seesaw" 
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
            {/* entering zone */}
            <Rect strokeEnabled={false} fill={secondaryColor} x={-visibleLength / 2 / ratio} y={-(width / 2 / ratio)} width={zoneVisibleLength / ratio} height={width / ratio} />

            {/* main body */}
            <Rect strokeEnabled={false} fill={primaryColor} x={-mainBodyVisibleLength / 2 / ratio} y={-(width / 2 / ratio)} width={mainBodyVisibleLength / ratio} height={width / ratio} />

            {/* output zone */}
            <Rect strokeEnabled={false} fill={secondaryColor} x={mainBodyVisibleLength / 2 / ratio} y={-(width / 2 / ratio)} width={zoneVisibleLength / ratio} height={width / ratio} />
            
            {/* indicating arrow */}
            <Arrow x={0} y={0} points={[-20, 0, 20, 0]} stroke={secondaryColor} pointerLength={5} pointerWidth={3} fill={secondaryColor} />
        </Group>
    )
}
