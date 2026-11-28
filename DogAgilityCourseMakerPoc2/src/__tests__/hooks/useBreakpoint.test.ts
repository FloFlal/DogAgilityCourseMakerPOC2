import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
    useBreakpoint,
    TABLET_MIN_PX,
    DESKTOP_MIN_PX,
} from '../../hooks/useBreakpoint';

type Listener = (event: MediaQueryListEvent) => void;

/**
 * Controllable matchMedia mock: tests flip the viewport size class and
 * emit change events like a real browser would on rotate / resize.
 */
function stubMatchMedia(initialWidth: number): {
    setWidth: (width: number) => void;
} {
    let width = initialWidth;
    const listeners = new Map<string, Set<Listener>>();

    const matches = (query: string): boolean =>
        query.includes(`${DESKTOP_MIN_PX}`)
            ? width >= DESKTOP_MIN_PX
            : width >= TABLET_MIN_PX;

    const mql = (query: string): MediaQueryList =>
        ({
            matches: matches(query),
            media: query,
            onchange: null,
            addListener: (): void => {},
            removeListener: (): void => {},
            addEventListener: (_: string, listener: Listener): void => {
                const set = listeners.get(query) ?? new Set();
                set.add(listener);
                listeners.set(query, set);
            },
            removeEventListener: (_: string, listener: Listener): void => {
                listeners.get(query)?.delete(listener);
            },
            dispatchEvent: (): boolean => false,
        }) as unknown as MediaQueryList;

    vi.stubGlobal('matchMedia', vi.fn(mql) as unknown as typeof window.matchMedia);

    return {
        setWidth(next: number): void {
            width = next;
            listeners.forEach((set, query) => {
                const event = {
                    matches: matches(query),
                    media: query,
                } as MediaQueryListEvent;
                set.forEach((listener) => listener(event));
            });
        },
    };
}

describe('useBreakpoint', () => {
    let viewport: ReturnType<typeof stubMatchMedia>;

    beforeEach(() => {
        viewport = stubMatchMedia(1280);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('resolves desktop at 1024 px and above', () => {
        const { result } = renderHook(() => useBreakpoint());

        expect(result.current).toBe('desktop');
    });

    it('resolves tablet between 768 and 1023 px', () => {
        viewport.setWidth(900);
        const { result } = renderHook(() => useBreakpoint());

        expect(result.current).toBe('tablet');
    });

    it('resolves mobile below 768 px', () => {
        viewport.setWidth(390);
        const { result } = renderHook(() => useBreakpoint());

        expect(result.current).toBe('mobile');
    });

    it('updates when the viewport crosses a breakpoint', () => {
        const { result } = renderHook(() => useBreakpoint());

        expect(result.current).toBe('desktop');

        act(() => {
            viewport.setWidth(768);
        });
        expect(result.current).toBe('tablet');

        act(() => {
            viewport.setWidth(500);
        });
        expect(result.current).toBe('mobile');

        act(() => {
            viewport.setWidth(1200);
        });
        expect(result.current).toBe('desktop');
    });
});
