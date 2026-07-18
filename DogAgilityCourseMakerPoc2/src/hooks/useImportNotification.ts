import toast from 'react-hot-toast';
import { useDrawingStore } from '../store/useDrawingStore';
import { useEffect } from 'react';

/**
 * Hook pour gérer les notifications d'import/export
 * Affiche automatiquement les erreurs d'import sous forme de toast
 */
export function useImportNotification(): void {
    const { importError, clearImportError } = useDrawingStore();

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
