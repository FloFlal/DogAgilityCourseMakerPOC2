import { describe, expect, it, vi, beforeEach } from 'vitest';
import { create } from 'zustand';
import { logger } from '../../store/middleware/logger';

interface TestState {
    value: number;
    setValue: (v: number) => void;
}

describe('logger middleware', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('log les états précédent et suivant à chaque mutation', () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

        const useTestStore = create<TestState>()(
            logger((set) => ({
                value: 0,
                setValue: (v: number): void => set({ value: v }),
            })),
        );

        useTestStore.getState().setValue(42);

        expect(useTestStore.getState().value).toBe(42);
        expect(consoleSpy).toHaveBeenCalledWith('[zustand] previous state', expect.objectContaining({ value: 0 }));
        expect(consoleSpy).toHaveBeenCalledWith('[zustand] next state', expect.objectContaining({ value: 42 }));
    });

    it('ne bloque pas la propagation des mutations', () => {
        vi.spyOn(console, 'log').mockImplementation(() => undefined);

        const useTestStore = create<TestState>()(
            logger((set, get) => ({
                value: 0,
                setValue: (v: number): void => set({ value: get().value + v }),
            })),
        );

        useTestStore.getState().setValue(10);
        useTestStore.getState().setValue(15);

        expect(useTestStore.getState().value).toBe(25);
    });
});
