import { describe, expect, it, vi } from 'vitest';
import { createSelector } from '../../store/createSelector';

interface TestState {
    items: string[];
    flag: boolean;
}

const selectItems = (state: TestState): string[] => state.items;
const selectFlag = (state: TestState): boolean => state.flag;

describe('createSelector', () => {
    it("ne recalcule pas si les entrées n'ont pas changé", () => {
        const state: TestState = { items: ['a', 'b'], flag: true };
        const combiner = vi.fn((items: string[], flag: boolean) => `${items.join(',')}-${flag}`);
        const selector = createSelector(selectItems, selectFlag, combiner);

        const first = selector(state);
        const second = selector(state);

        expect(first).toBe('a,b-true');
        expect(second).toBe('a,b-true');
        expect(combiner).toHaveBeenCalledTimes(1);
    });

    it('recalcule quand une entrée change', () => {
        const combiner = vi.fn((items: string[]) => items.length);
        const selector = createSelector(selectItems, combiner);

        selector({ items: ['a'], flag: false });
        selector({ items: ['a', 'b'], flag: false });

        expect(combiner).toHaveBeenCalledTimes(2);
    });

    it('retourne une valeur stable par référence entre deux appels sans changement', () => {
        const state: TestState = { items: ['a'], flag: true };
        const selector = createSelector(selectItems, (items) => items.map((i) => i.toUpperCase()));

        const first = selector(state);
        const second = selector(state);

        expect(first).toBe(second);
    });

    it('recalcule quand une entrée primitive change même avec la même référence objet', () => {
        const items = ['a'];
        const selector = createSelector(selectFlag, selectItems, (flag) => (flag ? 'on' : 'off'));

        expect(selector({ items, flag: true })).toBe('on');
        expect(selector({ items, flag: false })).toBe('off');
    });
});
