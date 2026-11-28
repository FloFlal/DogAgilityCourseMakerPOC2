import React, { useMemo } from 'react';
import { Layer, Line, Rect, Text } from 'react-konva';
import { GRID_OPACITY, GRID_STROKE, METERS_TO_PX } from '../../constants/canvasDefaults';
import type { GridLayerProps } from '../../types/canvasTypes';

/** Ruler label style: dark gray, readable on the light "course-plan" background. */
const RULER_FONT_SIZE = 10;
const RULER_TEXT_COLOR = '#475569';
/** Width of a top ruler label box, centered on its vertical line. */
const RULER_LABEL_WIDTH = 24;

/**
 * Canvas grid layer (US-033): draws the physical field as a peripheral
 * rectangle, the grid lines **inside this rectangle only**, and the
 * dimension rulers (line coordinates in meters, counted from the
 * top-left corner) in the dead zone that always surrounds the field.
 */
export const GridLayer: React.FC<GridLayerProps> = ({ fieldX, fieldY, fieldWidth, fieldHeight, cellPx }) => {
    const content = useMemo((): React.ReactElement[] => {
        const elements: React.ReactElement[] = [];

        // Peripheral field rectangle (US-033): the visual boundary of the terrain.
        elements.push(
            <Rect
                key="field-rect"
                x={fieldX}
                y={fieldY}
                width={fieldWidth}
                height={fieldHeight}
                stroke={GRID_STROKE}
                strokeWidth={2}
                opacity={0.8}
                listening={false}
            />
        );

        // Grid lines: strictly inside the field rectangle.
        for (let x = 0; x <= fieldWidth; x += cellPx) {
            elements.push(
                <Line
                    key={`v-${x}`}
                    x={fieldX + x}
                    y={fieldY}
                    points={[0, 0, 0, fieldHeight]}
                    stroke={GRID_STROKE}
                    strokeWidth={1}
                    opacity={GRID_OPACITY}
                    listening={false}
                />
            );
        }

        for (let y = 0; y <= fieldHeight; y += cellPx) {
            elements.push(
                <Line
                    key={`h-${y}`}
                    x={fieldX}
                    y={fieldY + y}
                    points={[0, 0, fieldWidth, 0]}
                    stroke={GRID_STROKE}
                    strokeWidth={1}
                    opacity={GRID_OPACITY}
                    listening={false}
                />
            );
        }

        // Rulers (US-033): each horizontal line carries its dimension on the
        // left, each vertical line carries its dimension on the top, both
        // counted from the top-left corner of the field. The labels live in
        // the dead zone and follow the field when it is resized.
        // The origin (0) is displayed once, in the top-left corner (column
        // ruler): the row ruler starts at the first line below it.
        for (let y = cellPx; y <= fieldHeight; y += cellPx) {
            elements.push(
                <Text
                    key={`row-${y}`}
                    x={fieldX - RULER_FONT_SIZE * 4}
                    y={fieldY + y - RULER_FONT_SIZE / 2 - 1}
                    width={RULER_FONT_SIZE * 3}
                    align="right"
                    text={`${y / METERS_TO_PX}`}
                    fontSize={RULER_FONT_SIZE}
                    fill={RULER_TEXT_COLOR}
                    listening={false}
                />
            );
        }

        for (let x = 0; x <= fieldWidth; x += cellPx) {
            elements.push(
                <Text
                    key={`col-${x}`}
                    // Centered on its vertical line (review of US-033).
                    x={fieldX + x - RULER_LABEL_WIDTH / 2}
                    y={fieldY - RULER_FONT_SIZE - 4}
                    width={RULER_LABEL_WIDTH}
                    align="center"
                    text={`${x / METERS_TO_PX}`}
                    fontSize={RULER_FONT_SIZE}
                    fill={RULER_TEXT_COLOR}
                    listening={false}
                />
            );
        }

        return elements;
    }, [fieldX, fieldY, fieldWidth, fieldHeight, cellPx]);

    return (
        <Layer>
            {content}
        </Layer>
    );
};
