import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useDrawingStore } from '../store/useDrawingStore';
import { selectImportError } from '../store/selectors';
import { useEffect } from 'react';

/**
 * Hook handling import/export notifications.
 * Automatically displays import errors as a toast. Errors are structured
 * i18n codes coming from the schema/service: they are translated here in
 * the current interface language.
 */
export function useImportNotification(): void {
    const importError = useDrawingStore(selectImportError);
    const clearImportError = useDrawingStore((state) => state.clearImportError);
    const { t } = useTranslation();

    useEffect(() => {
        if (importError) {
            toast.error(t(importError.code), {
                duration: 6000,
                position: 'top-right',
            });
            // Clear the error after displaying it
            clearImportError();
        }
    }, [importError, clearImportError, t]);
}
