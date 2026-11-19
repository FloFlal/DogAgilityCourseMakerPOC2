import React, { useRef } from 'react';
import { Stage } from 'react-konva';
import Konva from 'konva';
import { useDrawingStore } from '../store/useDrawingStore';
import { useStageDimensions } from '../hooks/useStageDimensions';
import { useObstacleDrag } from '../hooks/useObstacleDrag';
import { useObstacleTransform } from '../hooks/useObstacleTransform';
import { GridLayer } from './canvas/gridLayer';
import { ObstaclesLayer } from './canvas/obstaclesLayer';
import { TransformerComponent } from './canvas/transformerComponent';
import type { KonvaMouseEvent } from '../types/obstacleTypes';

/**
 * Zone de dessin principale : compose le Stage Konva à partir des
 * couches dédiées (quadrillage, obstacles, transformer) et des hooks
 * de gestion des obstacles.
 */
export const CanvasArea: React.FC = () => {
    const obstacles = useDrawingStore((state) => state.obstacles);
    const selectedId = useDrawingStore((state) => state.selectedId);
    const setSelectedId = useDrawingStore((state) => state.setSelectedId);
    const addShape = useDrawingStore((state) => state.addShape);
    const gridSize = useDrawingStore((state) => state.gridSize);
    const { onDragStart, onDragEnd } = useObstacleDrag();
    const onTransformEnd = useObstacleTransform();
    const { width, height } = useStageDimensions();
    const stageRef = useRef<Konva.Stage>(null);

    const handleStageClick = (e: KonvaMouseEvent): void => {
        // unselect obstacle when click on background
        if (e.target !== e.target.getStage()) return;

        if (selectedId) {
            setSelectedId(null);
        } else {
            const pointer = stageRef.current?.getPointerPosition();

            if (pointer) {
                addShape(pointer.x, pointer.y);
            }
        }
    };

    return (
        <div className="flex-1 h-screen bg-slate-950 relative overflow-hidden">
            <Stage
                width={width}
                height={height}
                ref={stageRef}
                onClick={handleStageClick}
            >
                {/* Grid layer - limited to drawing area */}
                <GridLayer width={width} height={height} gridSize={gridSize} />

                <ObstaclesLayer
                    shapes={obstacles}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onTransformEnd={onTransformEnd}
                />

                {/*The component that surround the obstacle*/}
                <TransformerComponent selectedId={selectedId} />
            </Stage>
        </div>
    );
};
