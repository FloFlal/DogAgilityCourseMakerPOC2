import toast from 'react-hot-toast';
import { useDrawingStore } from '../store/useDrawingStore';
import { selectImportError } from '../store/selectors';
import { useEffect } from 'react';

/**
 * Hook handling import/export notifications
 * Automatically displays import errors as a toast
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
            // Clear the error after displaying it
            clearImportError();
        }
    }, [importError, clearImportError]);
}
