import React, { useEffect, useRef } from 'react';
import { Layer, Transformer } from 'react-konva';
import Konva from 'konva';
import type { Box } from 'konva/lib/shapes/Transformer';
import { MIN_OBSTACLE_SIZE } from '../../constants/canvasDefaults';
import { useDrawingStore } from '../../store/useDrawingStore';
import type { TransformerComponentProps } from '../../types/canvasTypes';
import type { ObstacleType } from '../../types/obstacleTypes';

/**
 * Obstacles drawn along the vertical axis: their bounding box is tall and
 * narrow, so the default top-center rotate handle sits on the obstacle axis
 * and reads as part of the drawing. For these types the rotate handle is
 * moved to the side of the bounding box (rotateAnchorAngle 90 = middle-right).
 */
const VERTICAL_OBSTACLE_TYPES: ReadonlySet<ObstacleType> = new Set<ObstacleType>([
    'weavePols',
    'semiWeavePols',
]);

/**
 * Tunnel types (US-020): the flexible tube is manipulated only through its
 * two end anchors (rope physics), so it is selectable without any transformer
 * frame or rotate handle - the transformer must not attach to it.
 */
const TUNNEL_TYPES: ReadonlySet<ObstacleType> = new Set<ObstacleType>([
    'tunnel6m',
    'tunnel5m',
    'tunnel4m',
    'tunnel3m',
]);

/**
 * Transformer component: surrounds the selected obstacle and applies
 * the transform constraints (minimum size, rotation).
 */
export const TransformerComponent: React.FC<TransformerComponentProps> = ({ selectedId }) => {
    const transformerRef = useRef<Konva.Transformer>(null);
    const shapes = useDrawingStore((state) => state.obstacles);

    // Vertical obstacles get their rotate handle on the side of the box;
    // tunnels get no transformer at all (anchor-based manipulation only).
    const selectedType = shapes.find((shape) => shape.id === selectedId)?.type;
    const rotateAnchorAngle = selectedType !== undefined && VERTICAL_OBSTACLE_TYPES.has(selectedType) ? 90 : 0;
    const skipTransformer = selectedType !== undefined && TUNNEL_TYPES.has(selectedType);

    useEffect((): void => {
        const transformer = transformerRef.current;

        if (!transformer) return;

        const stage = transformer.getStage();

        if (!stage) return;

        if (selectedId && !skipTransformer) {
            const selectedNode = stage.findOne('#' + selectedId);

            if (selectedNode) {
                transformer.nodes([selectedNode]);
                transformer.getLayer()?.batchDraw();

                return;
            }
        }

        transformer.nodes([]);
        transformer.getLayer()?.batchDraw();
    }, [selectedId, shapes, skipTransformer]);

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
                rotateAnchorAngle={rotateAnchorAngle}
                borderStroke='red'
                anchorCornerRadius={5}
                enabledAnchors={[]}
            />
        </Layer>
    );
};
