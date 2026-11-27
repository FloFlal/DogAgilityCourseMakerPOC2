import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import toast from 'react-hot-toast';
import { useImportNotification } from '../../hooks/useImportNotification';
import { useDrawingStore } from '../../store/useDrawingStore';

vi.mock('react-hot-toast', () => ({
    default: { error: vi.fn(), success: vi.fn() },
}));

describe('useImportNotification', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useDrawingStore.setState({ importError: null, obstacles: [] });
    });

    it("affiche un toast traduit puis réinitialise l'erreur d'import", () => {
        renderHook(() => useImportNotification());

        act(() => {
            useDrawingStore.setState({ importError: { code: 'import.errors.invalidJson' } });
        });

        expect(toast.error).toHaveBeenCalledTimes(1);
        // The structured i18n code is translated in the current language
        // (the test suite seeds French).
        expect(toast.error).toHaveBeenCalledWith(
            'Syntaxe JSON invalide',
            expect.objectContaining({ position: 'top-right' }),
        );
        expect(useDrawingStore.getState().importError).toBeNull();
    });

    it("n'affiche aucun toast tant qu'il n'y a pas d'erreur", () => {
        renderHook(() => useImportNotification());

        act(() => {
            useDrawingStore.setState({ obstacles: [] });
        });

        expect(toast.error).not.toHaveBeenCalled();
    });
});
