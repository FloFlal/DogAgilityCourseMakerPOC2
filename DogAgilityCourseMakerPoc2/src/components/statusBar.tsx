import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDrawingStore } from '../store/useDrawingStore';
import { selectObstacleCount, selectSelectedObstacle } from '../store/selectors';

/**
 * Information banner at the bottom of the drawing area (US-029): reports
 * view over the course state (obstacle count) and, when relevant,
 * on the selected obstacle (translated type, x/y position in px). Entirely
 * derived from the store via memoized selectors: no state duplication,
 * no writes. Overlaid on the canvas (absolute position), outside the sidebar.
 */
export const StatusBar: React.FC = () => {
    const { t } = useTranslation();

    // Atomic selectors: each piece of information is subscribed individually
    const count = useDrawingStore(selectObstacleCount);
    const selected = useDrawingStore(selectSelectedObstacle);

    return (
        <div
            role="status"
            aria-live="polite"
            className="absolute bottom-0 left-0 right-0 z-10 flex items-center gap-6 px-4 py-1.5 bg-slate-800 text-slate-300 text-xs border-t border-slate-700"
        >
            <span data-testid="status-count">{t('statusBar.count', { count })}</span>
            {selected && (
                <span data-testid="status-selected">
                    {t('statusBar.type', { type: t(`obstacles.${selected.type}`) })}
                    {' · '}
                    <span className="font-mono">
                        {t('statusBar.position', { x: Math.round(selected.x), y: Math.round(selected.y) })}
                    </span>
                </span>
            )}
        </div>
    );
};
