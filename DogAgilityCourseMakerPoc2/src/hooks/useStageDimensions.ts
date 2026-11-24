import { useEffect, useState } from 'react';
import { SIDEBAR_WIDTH_PX } from '../constants/canvasDefaults';
import type { CanvasDimensions } from '../types/canvasTypes';

/**
 * Hook returning the Konva Stage dimensions:
 * window width minus the sidebar, window height.
 * Updates automatically when the window is resized.
 */
export function useStageDimensions(): CanvasDimensions {
    const [dimensions, setDimensions] = useState<CanvasDimensions>({
        width: window.innerWidth - SIDEBAR_WIDTH_PX,
        height: window.innerHeight,
    });

    useEffect((): (() => void) => {
        const handleResize = (): void => {
            setDimensions({
                width: window.innerWidth - SIDEBAR_WIDTH_PX,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);

        return (): void => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return dimensions;
}
