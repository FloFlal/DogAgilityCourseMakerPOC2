import { useEffect, useState } from 'react';
import { SIDEBAR_WIDTH_PX } from '../constants/canvasDefaults';
import type { CanvasDimensions } from '../types/canvasTypes';

/**
 * Hook retournant les dimensions du Stage Konva :
 * largeur de la fenêtre moins la sidebar, hauteur de la fenêtre.
 * Se met à jour automatiquement au redimensionnement de la fenêtre.
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
