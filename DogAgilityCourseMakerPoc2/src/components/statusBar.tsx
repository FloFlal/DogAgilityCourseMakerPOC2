import React from 'react';
import { useTranslation } from 'react-i18next';
import { useDrawingStore } from '../store/useDrawingStore';
import { selectObstacleCount, selectSelectedObstacle } from '../store/selectors';

/**
 * Bandeau d'informations en bas de la zone de dessin (US-029) : retour
 * permanent sur l'état du parcours (nombre d'obstacles) et, le cas échéant,
 * sur l'obstacle sélectionné (type traduit, position x/y en px). Entièrement
 * dérivé du store via des sélecteurs mémoïsés : aucune duplication d'état,
 * aucune écriture. Superposé au canvas (position absolue), hors de la sidebar.
 */
export const StatusBar: React.FC = () => {
    const { t } = useTranslation();

    // Sélecteurs atomiques : chaque information est souscrite individuellement
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
