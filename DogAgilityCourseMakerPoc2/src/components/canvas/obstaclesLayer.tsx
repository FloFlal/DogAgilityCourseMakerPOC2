import React from 'react';
import { Layer } from 'react-konva';
import { Jump } from '../../obstacles/jump';
import { Seesaw } from '../../obstacles/seesaw';
import { DogWalk } from '../../obstacles/dogWalk';
import { AFrame } from '../../obstacles/aFrame';
import { Oxer } from '../../obstacles/oxer';
import { LongJump } from '../../obstacles/longJump';
import { Tire } from '../../obstacles/tire';
import { Tunnel } from '../../obstacles/tunnel';
import { WeavePols } from '../../obstacles/weavePols';
import {
    A_FRAME_DEFAULTS,
    DOG_WALK_DEFAULTS,
    JUMP_DEFAULTS,
    OBSTACLE_PRIMARY_COLOR,
    OBSTACLE_RATIO,
    OBSTACLE_SECONDARY_COLOR,
    OXER_DEFAULTS,
    LONG_JUMP_DEFAULTS,
    SEMI_WEAVE_POLES_DEFAULTS,
    SEESAW_DEFAULTS,
    TIRE_DEFAULTS,
    TUNNEL_LENGTHS_BY_TYPE,
    TUNNEL_OUTER_DIAMETER,
    TUNNEL_SEGMENT_LENGTH,
    WEAVE_POLES_DEFAULTS,
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
    onPointsChange,
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
                    case 'oxer':
                        return <Oxer {...commonProps} key={shape.id} {...OXER_DEFAULTS} />;
                    case 'longJump':
                        return <LongJump {...commonProps} key={shape.id} {...LONG_JUMP_DEFAULTS} />;
                    case 'tire':
                        return <Tire {...commonProps} key={shape.id} {...TIRE_DEFAULTS} />;
                    case 'seesaw':
                        return <Seesaw {...commonProps} key={shape.id} {...SEESAW_DEFAULTS} />;
                    case 'dogWalk':
                        return <DogWalk {...commonProps} key={shape.id} {...DOG_WALK_DEFAULTS} />;
                    case 'aFrame':
                        return <AFrame {...commonProps} key={shape.id} {...A_FRAME_DEFAULTS} />;
                    case 'weavePols':
                        return <WeavePols {...commonProps} key={shape.id} {...WEAVE_POLES_DEFAULTS} />;
                    case 'semiWeavePols':
                        return <WeavePols {...commonProps} key={shape.id} {...SEMI_WEAVE_POLES_DEFAULTS} />;
                    case 'tunnel6m':
                        return <Tunnel {...commonProps} key={shape.id} length={TUNNEL_LENGTHS_BY_TYPE.tunnel6m} diameter={TUNNEL_OUTER_DIAMETER} segmentLength={TUNNEL_SEGMENT_LENGTH} points={shape.points} onPointsChange={onPointsChange} />;
                    case 'tunnel5m':
                        return <Tunnel {...commonProps} key={shape.id} length={TUNNEL_LENGTHS_BY_TYPE.tunnel5m} diameter={TUNNEL_OUTER_DIAMETER} segmentLength={TUNNEL_SEGMENT_LENGTH} points={shape.points} onPointsChange={onPointsChange} />;
                    case 'tunnel4m':
                        return <Tunnel {...commonProps} key={shape.id} length={TUNNEL_LENGTHS_BY_TYPE.tunnel4m} diameter={TUNNEL_OUTER_DIAMETER} segmentLength={TUNNEL_SEGMENT_LENGTH} points={shape.points} onPointsChange={onPointsChange} />;
                    case 'tunnel3m':
                        return <Tunnel {...commonProps} key={shape.id} length={TUNNEL_LENGTHS_BY_TYPE.tunnel3m} diameter={TUNNEL_OUTER_DIAMETER} segmentLength={TUNNEL_SEGMENT_LENGTH} points={shape.points} onPointsChange={onPointsChange} />;
                    default:
                        return null;
                }
            })}
        </Layer>
    );
};
