import toast from 'react-hot-toast';
import { useDrawingStore } from '../store/useDrawingStore';
import { selectImportError } from '../store/selectors';
import { useEffect } from 'react';

/**
 * Hook pour gérer les notifications d'import/export
 * Affiche automatiquement les erreurs d'import sous forme de toast
 */
export function useImportNotification(): void {
    const importError = useDrawingStore(selectImportError);
    const clearImportError = useDrawingStore((state) => state.clearImportError);

    useEffect(() => {
        if (importError) {
            toast.error(importError, {
                duration: 6000,
                position: 'top-right',
            });
            // Clear l'erreur après l'avoir affichée
            clearImportError();
        }
    }, [importError, clearImportError]);
}
