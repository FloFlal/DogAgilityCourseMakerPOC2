import React, { useCallback, useRef, useState } from 'react';
import { Stage } from 'react-konva';
import Konva from 'konva';
import { useTranslation } from 'react-i18next';
import { useDrawingStore } from '../store/useDrawingStore';
import {
    CANVAS_BACKGROUND,
    cellSizePx,
    FIELD_DEAD_ZONE_PX,
    METERS_TO_PX,
} from '../constants/canvasDefaults';
import {
    selectCellSizeMeters,
    selectCurrentShapeType,
    selectFieldLengthMeters,
    selectFieldWidthMeters,
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
import type { KonvaDragEvent, KonvaMouseEvent, KonvaWheelEvent, TunnelPoint } from '../types/obstacleTypes';

/**
 * Main drawing area: composes the Konva Stage from the
 * dedicated layers (grid, obstacles, transformer) and hooks
 * for obstacle management.
 */
export const CanvasArea: React.FC = () => {
    const { t } = useTranslation();
    // Responsive (US-026): the stage is measured on the real container.
    const canvasRef = useRef<HTMLDivElement>(null);
    const obstacles = useDrawingStore(selectObstacles);
    const selectedId = useDrawingStore(selectSelectedId);
    const setSelectedId = useDrawingStore((state) => state.setSelectedId);
    const addShape = useDrawingStore((state) => state.addShape);
    // Field and grid cell (US-033): both live in the field slice, in meters.
    const currentShapeType = useDrawingStore(selectCurrentShapeType);
    const fieldWidthMeters = useDrawingStore(selectFieldWidthMeters);
    const fieldLengthMeters = useDrawingStore(selectFieldLengthMeters);
    const cellSizeMeters = useDrawingStore(selectCellSizeMeters);
    const { handleDragStart, handleDragEnd } = useObstacleDrag();
    const handleTransformEnd = useObstacleTransform();
    const updateShape = useDrawingStore((state) => state.updateShape);
    // Tunnel-only (US-020): an anchor drag rewrites the whole joint chain.
    const handlePointsChange = useCallback((id: string, points: TunnelPoint[]): void => {
        updateShape(id, { points });
    }, [updateShape]);
    const { width, height } = useStageDimensions(canvasRef);
    const stageRef = useRef<Konva.Stage>(null);

    useCanvasKeyboard();

    // Pan of the drawing view (review of US-033): the field is larger than
    // the viewport on small screens, so the view must be scrollable. The
    // stage is a viewport window over the "world" (field + dead zones):
    // dragging the empty background (when no tool is armed, Konva built-in
    // stage drag) or using the mouse wheel moves the window, clamped so the
    // field can never be dragged completely out of sight.
    const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
    const worldWidth = FIELD_DEAD_ZONE_PX * 2 + fieldWidthMeters * METERS_TO_PX;
    const worldHeight = FIELD_DEAD_ZONE_PX * 2 + fieldLengthMeters * METERS_TO_PX;

    const clampStagePos = useCallback((pos: { x: number; y: number }): { x: number; y: number } => ({
        x: Math.min(0, Math.max(width - worldWidth, pos.x)),
        y: Math.min(0, Math.max(height - worldHeight, pos.y)),
    }), [width, height, worldWidth, worldHeight]);

    const handleStageWheel = (e: KonvaWheelEvent): void => {
        e.evt.preventDefault();
        setStagePos((pos) => clampStagePos({ x: pos.x - e.evt.deltaX, y: pos.y - e.evt.deltaY }));
    };

    const handleStageDragMove = (e: KonvaDragEvent): void => {
        setStagePos(clampStagePos(e.target.position()));
    };

    const handleStageClick = (e: KonvaMouseEvent): void => {
        // Obstacle click: handled by the obstacle itself (selection).
        if (e.target !== e.target.getStage()) return;

        // Background click: place the current tool (no-op with no active tool).
        // Deselection goes through clicking an obstacle or pressing Escape.
        // World coordinates: the pointer position is converted through the
        // stage transform so placement stays correct while panned.
        const pointer = stageRef.current?.getRelativePointerPosition();

        if (pointer) {
            addShape(pointer.x, pointer.y);
        }
    };

    return (
        <div
            ref={canvasRef}
            className="flex-1 h-full min-h-0 relative overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400"
            // Light "course-plan sheet" background (US-030): value driven by the
            // constante CANVAS_BACKGROUND (canvasDefaults.ts).
            // touch-action: none (US-026): touch dragging an obstacle must not
            // scroll the page on mobile/tablet.
            style={{ backgroundColor: CANVAS_BACKGROUND, touchAction: 'none' }}
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
                x={stagePos.x}
                y={stagePos.y}
                ref={stageRef}
                onClick={handleStageClick}
                // Panning (review of US-033): drag the empty background to
                // move the view (a drag suppresses the click, so the armed
                // tool stays exclusive); the wheel pans too.
                draggable={currentShapeType === null}
                onDragMove={handleStageDragMove}
                onWheel={handleStageWheel}
            >
                {/* Field + grid layer (US-033): grid limited to the field
                    rectangle, rulers in the dead zone around it. */}
                <GridLayer
                    fieldX={FIELD_DEAD_ZONE_PX}
                    fieldY={FIELD_DEAD_ZONE_PX}
                    fieldWidth={fieldWidthMeters * METERS_TO_PX}
                    fieldHeight={fieldLengthMeters * METERS_TO_PX}
                    cellPx={cellSizePx(cellSizeMeters)}
                />

                <ObstaclesLayer
                    shapes={obstacles}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onTransformEnd={handleTransformEnd}
                    onPointsChange={handlePointsChange}
                />

                {/*The component that surround the obstacle*/}
                <TransformerComponent selectedId={selectedId} />
            </Stage>

            {/* Bandeau d'informations (US-029) : superposé en bas de la zone de dessin */}
            <StatusBar />
        </div>
    );
};
