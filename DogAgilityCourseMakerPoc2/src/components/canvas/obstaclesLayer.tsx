import React from 'react';
import { Layer } from 'react-konva';
import { Jump } from '../../obstacles/jump';
import { Seesaw } from '../../obstacles/seesaw';
import { DogWalk } from '../../obstacles/dogWalk';
import { AFrame } from '../../obstacles/aFrame';
import {
    A_FRAME_DEFAULTS,
    DOG_WALK_DEFAULTS,
    JUMP_DEFAULTS,
    OBSTACLE_PRIMARY_COLOR,
    OBSTACLE_RATIO,
    OBSTACLE_SECONDARY_COLOR,
    SEESAW_DEFAULTS,
} from '../../constants/canvasDefaults';
import type { BaseObstacleProps } from '../../types/obstacleTypes';
import type { ObstaclesLayerProps } from '../../types/canvasTypes';

/**
 * Obstacles layer: renders each obstacle according to its type and
 * delegates the selection, drag and transform handlers.
 */
export const ObstaclesLayer: React.FC<ObstaclesLayerProps> = ({
    shapes,
    selectedId,
    onSelect,
    onDragStart,
    onDragEnd,
    onTransformEnd,
}) => {
    const buildCommonProps = (shape: ObstaclesLayerProps['shapes'][number]): BaseObstacleProps => {
        const isSelected = shape.id === selectedId;

        return {
            ratio: OBSTACLE_RATIO,
            id: shape.id,
            x: shape.x,
            y: shape.y,
            fill: shape.fill,
            rotation: shape.rotation,
            draggable: true,
            isSelected,
            primaryColor: OBSTACLE_PRIMARY_COLOR,
            secondaryColor: OBSTACLE_SECONDARY_COLOR,
            onClick: (e): void => {
                e.cancelBubble = true; // avoid click on Stage
                onSelect(shape.id);
            },
            onTap: (e): void => {
                e.cancelBubble = true;
                onSelect(shape.id);
            },
            onDrag: (): void => onDragStart(shape.id),
            onDragEnd: (e): void => onDragEnd(shape.id, e.target.x(), e.target.y()),
            onTransformEnd: (e): void =>
                onTransformEnd(shape.id, e.target.x(), e.target.y(), e.target.rotation()),
        };
    };

    return (
        <Layer>
            {shapes.map((shape) => {
                const commonProps = buildCommonProps(shape);

                switch (shape.type) {
                    case 'jump':
                        return <Jump {...commonProps} key={shape.id} {...JUMP_DEFAULTS} />;
                    case 'seesaw':
                        return <Seesaw {...commonProps} key={shape.id} {...SEESAW_DEFAULTS} />;
                    case 'dogWalk':
                        return <DogWalk {...commonProps} key={shape.id} {...DOG_WALK_DEFAULTS} />;
                    case 'aFrame':
                        return <AFrame {...commonProps} key={shape.id} {...A_FRAME_DEFAULTS} />;
                    default:
                        return null;
                }
            })}
        </Layer>
    );
};
