import React, { useRef } from 'react';
import { Stage } from 'react-konva';
import Konva from 'konva';
import { useDrawingStore } from '../store/useDrawingStore';
import {
    selectGridSize,
    selectObstacles,
    selectSelectedId,
} from '../store/selectors';
import { useStageDimensions } from '../hooks/useStageDimensions';
import { useCanvasKeyboard } from '../hooks/useCanvasKeyboard';
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
    const obstacles = useDrawingStore(selectObstacles);
    const selectedId = useDrawingStore(selectSelectedId);
    const setSelectedId = useDrawingStore((state) => state.setSelectedId);
    const addShape = useDrawingStore((state) => state.addShape);
    const gridSize = useDrawingStore(selectGridSize);
    const { onDragStart, onDragEnd } = useObstacleDrag();
    const onTransformEnd = useObstacleTransform();
    const { width, height } = useStageDimensions();
    const stageRef = useRef<Konva.Stage>(null);

    useCanvasKeyboard();

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
        <div
            className="flex-1 h-screen bg-slate-950 relative overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
            tabIndex={0}
            role="group"
            aria-label="Zone de dessin du parcours d'agility"
            aria-describedby="canvas-keyboard-help"
        >
            <p id="canvas-keyboard-help" className="sr-only">
                Cliquez sur le canvas pour ajouter un obstacle. Utilisez les flèches pour déplacer l'obstacle
                sélectionné (Maj + flèche pour un déplacement fin d'un pixel), Suppr pour le supprimer et
                Échap pour le désélectionner.
            </p>
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
