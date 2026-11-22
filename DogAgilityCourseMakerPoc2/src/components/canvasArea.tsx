import React, { useRef } from 'react';
import { Stage } from 'react-konva';
import Konva from 'konva';
import { useTranslation } from 'react-i18next';
import { useDrawingStore } from '../store/useDrawingStore';
import { CANVAS_BACKGROUND } from '../constants/canvasDefaults';
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
import { StatusBar } from './statusBar';
import type { KonvaMouseEvent } from '../types/obstacleTypes';

/**
 * Zone de dessin principale : compose le Stage Konva à partir des
 * couches dédiées (quadrillage, obstacles, transformer) et des hooks
 * de gestion des obstacles.
 */
export const CanvasArea: React.FC = () => {
    const { t } = useTranslation();
    const obstacles = useDrawingStore(selectObstacles);
    const selectedId = useDrawingStore(selectSelectedId);
    const setSelectedId = useDrawingStore((state) => state.setSelectedId);
    const addShape = useDrawingStore((state) => state.addShape);
    const gridSize = useDrawingStore(selectGridSize);
    const { handleDragStart, handleDragEnd } = useObstacleDrag();
    const handleTransformEnd = useObstacleTransform();
    const { width, height } = useStageDimensions();
    const stageRef = useRef<Konva.Stage>(null);

    useCanvasKeyboard();

    const handleStageClick = (e: KonvaMouseEvent): void => {
        // Clic sur un obstacle : géré par l'obstacle lui-même (sélection).
        if (e.target !== e.target.getStage()) return;

        // Clic sur le fond : pose de l'outil courant (no-op sans outil actif).
        // La désélection passe par le clic sur un obstacle ou par Échap.
        const pointer = stageRef.current?.getPointerPosition();

        if (pointer) {
            addShape(pointer.x, pointer.y);
        }
    };

    return (
        <div
            className="flex-1 h-screen relative overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
            // Fond clair « feuille de plan » (US-030) : valeur pilotée par la
            // constante CANVAS_BACKGROUND (canvasDefaults.ts).
            style={{ backgroundColor: CANVAS_BACKGROUND }}
            tabIndex={0}
            role="group"
            aria-label={t('canvas.groupLabel')}
            aria-describedby="canvas-keyboard-help"
        >
            <p id="canvas-keyboard-help" className="sr-only">
                {t('canvas.keyboardHelp')}
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
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                />

                {/*The component that surround the obstacle*/}
                <TransformerComponent selectedId={selectedId} />
            </Stage>

            {/* Bandeau d'informations (US-029) : superposé en bas de la zone de dessin */}
            <StatusBar />
        </div>
    );
};
