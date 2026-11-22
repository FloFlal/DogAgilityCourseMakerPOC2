import { useEffect } from 'react';
import { useDrawingStore } from '../store/useDrawingStore';

// Pas fin par défaut, en px (la touche Maj donne le pas rapide)
const FINE_STEP_PX = 1;

// Déplacements par touche fléchée : [dx, dy]
const ARROW_DELTAS: Record<string, [number, number]> = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
};

// La navigation clavier ne s'applique pas aux champs de saisie
function isTextEntryTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) return false;

    return (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
    );
}

/**
 * Navigation clavier du canvas :
 * - Échap : désélectionne l'obstacle sélectionné, sinon désélectionne
 *   l'outil de pose actif
 * - Suppr / Retour arrière : supprime l'obstacle sélectionné
 * - Flèches : déplacement fin de l'obstacle sélectionné (un pixel)
 *   (Maj + flèche : déplacement rapide d'une case de gridSize), borné aux
 *   coords positives
 *
 * Ignoré lorsque le focus est dans un champ de saisie. Le listener est
 * attaché à window et relu via getState() : aucune re-souscription.
 */
export function useCanvasKeyboard(): void {
    useEffect((): (() => void) => {
        const handleKeyDown = (e: KeyboardEvent): void => {
            if (isTextEntryTarget(e.target)) return;

            const store = useDrawingStore.getState();
            const { selectedId } = store;

            // Échap désélectionne l'élément actif : l'obstacle sélectionné
            // s'il existe, sinon l'outil de pose (exclusion mutuelle).
            if (e.key === 'Escape') {
                if (selectedId !== null) {
                    store.setSelectedId(null);
                } else if (store.currentShapeType !== null) {
                    store.setCurrentShapeType(null);
                }

                return;
            }

            if (selectedId === null) return;

            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                store.deleteShape(selectedId);

                return;
            }

            const direction = ARROW_DELTAS[e.key];

            if (!direction) return;

            // Pas fin par défaut ; Maj accélère d'une case de grille.
            const step = e.shiftKey ? store.gridSize : FINE_STEP_PX;
            const obstacle = store.obstacles.find((o) => o.id === selectedId);

            if (!obstacle) return;

            e.preventDefault();
            store.updateShape(selectedId, {
                x: Math.max(0, obstacle.x + direction[0] * step),
                y: Math.max(0, obstacle.y + direction[1] * step),
            });
        };

        window.addEventListener('keydown', handleKeyDown);

        return (): void => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);
}
