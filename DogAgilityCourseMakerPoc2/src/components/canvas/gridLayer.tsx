import React, { useMemo } from 'react';
import { Layer, Line } from 'react-konva';
import { GRID_OPACITY, GRID_STROKE } from '../../constants/canvasDefaults';
import type { GridLayerProps } from '../../types/canvasTypes';

/**
 * Canvas grid layer: generates the vertical and
 * horizontal lines according to the grid size and the drawing area dimensions.
 */
export const GridLayer: React.FC<GridLayerProps> = ({ width, height, gridSize }) => {
    const gridLines = useMemo((): React.ReactElement[] => {
        const lines: React.ReactElement[] = [];

        for (let x = 0; x <= width; x += gridSize) {
            lines.push(
                <Line
                    key={`v-${x}`}
                    x={x}
                    y={0}
                    points={[0, 0, 0, height]}
                    stroke={GRID_STROKE}
                    strokeWidth={1}
                    opacity={GRID_OPACITY}
                    listening={false}
                />
            );
        }

        for (let y = 0; y <= height; y += gridSize) {
            lines.push(
                <Line
                    key={`h-${y}`}
                    x={0}
                    y={y}
                    points={[0, 0, width, 0]}
                    stroke={GRID_STROKE}
                    strokeWidth={1}
                    opacity={GRID_OPACITY}
                    listening={false}
                />
            );
        }

        return lines;
    }, [gridSize, width, height]);

    return (
        <Layer>
            {gridLines}
        </Layer>
    );
};
