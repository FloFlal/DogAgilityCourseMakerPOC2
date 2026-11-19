import React, { useEffect, useRef } from 'react';
import { Layer, Transformer } from 'react-konva';
import Konva from 'konva';
import type { Box } from 'konva/lib/shapes/Transformer';
import { MIN_OBSTACLE_SIZE } from '../../constants/canvasDefaults';
import { useDrawingStore } from '../../store/useDrawingStore';
import type { TransformerComponentProps } from '../../types/canvasTypes';

/**
 * Composant Transformer : entoure l'obstacle sélectionné et applique
 * les contraintes de transformation (taille minimale, rotation).
 */
export const TransformerComponent: React.FC<TransformerComponentProps> = ({ selectedId }) => {
    const transformerRef = useRef<Konva.Transformer>(null);
    const shapes = useDrawingStore((state) => state.obstacles);

    useEffect((): void => {
        const transformer = transformerRef.current;

        if (!transformer) return;

        const stage = transformer.getStage();

        if (!stage) return;

        if (selectedId) {
            const selectedNode = stage.findOne('#' + selectedId);

            if (selectedNode) {
                transformer.nodes([selectedNode]);
                transformer.getLayer()?.batchDraw();

                return;
            }
        }

        transformer.nodes([]);
        transformer.getLayer()?.batchDraw();
    }, [selectedId, shapes]);

    return (
        <Layer>
            <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox): Box => {
                    if (newBox.width < MIN_OBSTACLE_SIZE || newBox.height < MIN_OBSTACLE_SIZE) {
                        return oldBox;
                    }

                    return newBox;
                }}
                rotateEnabled={true}
                borderStroke='red'
                anchorCornerRadius={5}
                enabledAnchors={[]}
            />
        </Layer>
    );
};
