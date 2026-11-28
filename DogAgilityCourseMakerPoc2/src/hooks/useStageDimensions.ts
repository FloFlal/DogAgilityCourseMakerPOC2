import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import { SIDEBAR_WIDTH_PX } from '../constants/canvasDefaults';
import type { CanvasDimensions } from '../types/canvasTypes';

/**
 * Hook returning the Konva Stage dimensions, measured on the real canvas
 * container (US-026): the width is the actual available container width,
 * not "window minus a fixed sidebar", so every responsive layout (static
 * sidebar, tablet overlay, mobile dropdown) is handled. Updates through a
 * ResizeObserver on the container and on window resize.
 */
export function useStageDimensions(containerRef: RefObject<HTMLElement | null>): CanvasDimensions {
    // Fallback before the first measurement (jsdom has no layout engine:
    // clientWidth is 0 there, so the desktop default keeps the unit tests
    // meaningful). In the browser the ResizeObserver fires immediately
    // with the real container size.
    const [dimensions, setDimensions] = useState<CanvasDimensions>({
        width: window.innerWidth - SIDEBAR_WIDTH_PX,
        height: window.innerHeight,
    });

    useEffect((): (() => void) => {
        const element = containerRef.current;

        if (!element) return (): void => {};

        const update = (width: number, height: number): void => {
            if (width > 0) {
                setDimensions({ width, height });
            }
        };

        // Measure from the real content box of the container.
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];

            if (entry) {
                update(entry.contentRect.width, entry.contentRect.height);
            }
        });

        observer.observe(element);

        const handleResize = (): void => {
            update(element.clientWidth, element.clientHeight);
        };

        window.addEventListener('resize', handleResize);

        return (): void => {
            observer.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, [containerRef]);

    return dimensions;
}
