import { describe, expect, it, vi, afterEach } from 'vitest';
import { create } from 'zustand';
import { logger } from '../../store/middleware/logger';

interface TestState {
    value: number;
    setValue: (v: number) => void;
}

describe('logger middleware (hors développement)', () => {
    const originalDev = import.meta.env.DEV;

    afterEach(() => {
        import.meta.env.DEV = originalDev;
        vi.restoreAllMocks();
    });

    it('ne logge rien quand import.meta.env.DEV est faux', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        import.meta.env.DEV = false;

        const useTestStore = create<TestState>()(
            logger((set) => ({
                value: 0,
                setValue: (v: number): void => set({ value: v }),
            })),
        );

        useTestStore.getState().setValue(42);

        expect(useTestStore.getState().value).toBe(42);
        expect(consoleSpy).not.toHaveBeenCalled();
    });
});
