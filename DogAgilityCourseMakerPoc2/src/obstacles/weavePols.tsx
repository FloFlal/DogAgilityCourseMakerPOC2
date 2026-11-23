import { Arrow, Circle, Group, Rect } from "react-konva"
import type { WeavePolsProps } from "../types/obstacleTypes"

/**
 * Slalom (Weave poles) : rangée droite de poteaux que le chien serpente.
 *
 * Géométrie : toutes les longueurs sont divisées par le `ratio` global du
 * canvas. Le nombre réglementaire de poteaux (8 à 12, 12 par défaut) est
 * réparti sur l'axe vertical, espacé uniformément de -longueur/2 à
 * +longueur/2, la longueur valant (nombre de poteaux - 1) fois `poleSpacing`
 * (60 cm réglementaires). Au ratio par défaut (2.5), le diamètre nominal
 * de 4 cm tombe sous les 2 px : un rayon visuel minimal de 4 cm (Ø 8 cm)
 * garantit la lisibilité à l'écran. Les couleurs alternent le long de la
 * rangée, une flèche à gauche du premier poteau marque le sens d'entrée,
 * et un rectangle invisible englobe l'ensemble pour offrir une surface
 * stable de clic et de drag.
 */
export const WeavePols: React.FC<WeavePolsProps> = ({
  id,
  ratio,
  x,
  y,
  rotation,
  poleCount,
  poleSpacing,
  poleDiameter,
  primaryColor,
  secondaryColor,
  onClick,
  onTap,
  onDragEnd,
  onTransformEnd,
  onDrag,
  draggable = true
}) => {
    // Rayon visuel plancher : le Ø 4 cm réglementaire est trop fin à l'écran.
    const poleRadius = Math.max(poleDiameter / 2, 4);
    const rowLength = (poleCount - 1) * poleSpacing;
    const halfLength = rowLength / 2;
    // Surface de clic et de drag : pleine longueur plus un espacement de
    // chaque côté, largeur latérale d'un espacement entre poteaux.
    const hitWidth = poleSpacing;
    const hitLength = rowLength + 2 * poleSpacing;
    const arrowOffset = poleRadius / ratio + 8;

    return (
        <Group
          type="weavePols"
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
            <Rect strokeEnabled={false} fill="#777" opacity={0} x={-(hitWidth / 2 / ratio)} y={-(hitLength / 2 / ratio)} width={hitWidth / ratio} height={hitLength / ratio} />

            {/* evenly spaced poles, alternating colors */}
            {Array.from({ length: poleCount }, (_, i) => (
                <Circle key={i} x={0} y={(-halfLength + i * poleSpacing) / ratio} radius={poleRadius / ratio} fill={i % 2 === 0 ? primaryColor : secondaryColor} />
            ))}

            {/* entry arrow beside the first pole */}
            <Arrow x={0} y={0} points={[-arrowOffset, -(halfLength / ratio), -arrowOffset, -((halfLength - poleSpacing) / ratio)]} stroke={secondaryColor} pointerLength={5} pointerWidth={3} fill={secondaryColor} />
        </Group>
    )
}
