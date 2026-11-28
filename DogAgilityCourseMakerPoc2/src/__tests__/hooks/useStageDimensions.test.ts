import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStageDimensions } from '../../hooks/useStageDimensions';
import { SIDEBAR_WIDTH_PX } from '../../constants/canvasDefaults';

/**
 * Controllable ResizeObserver mock: tests fire the callback manually with
 * a contentRect, like the browser would when the canvas container is
 * resized (US-026).
 */
class MockResizeObserver {
    static instances: MockResizeObserver[] = [];

    callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
        this.callback = callback;
        MockResizeObserver.instances.push(this);
    }

    observe = vi.fn();

    unobserve = vi.fn();

    disconnect = vi.fn();

    trigger(width: number, height: number): void {
        this.callback(
            [{ contentRect: { width, height } } as ResizeObserverEntry],
            this as unknown as ResizeObserver,
        );
    }
}

describe('useStageDimensions', () => {
    beforeEach(() => {
        MockResizeObserver.instances = [];
        vi.stubGlobal('ResizeObserver', MockResizeObserver as unknown as typeof ResizeObserver);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('falls back to the window width minus the sidebar before any measurement', () => {
        const ref = { current: document.createElement('div') };
        const { result } = renderHook(() => useStageDimensions(ref));

        // jsdom has no layout engine: the initial fallback is the desktop
        // default (window width minus the sidebar).
        expect(result.current.width).toBe(window.innerWidth - SIDEBAR_WIDTH_PX);
        expect(result.current.height).toBe(window.innerHeight);
        expect(MockResizeObserver.instances).toHaveLength(1);
        expect(MockResizeObserver.instances[0].observe).toHaveBeenCalledWith(ref.current);
    });

    it('measures the real container through the ResizeObserver', () => {
        const ref = { current: document.createElement('div') };
        const { result } = renderHook(() => useStageDimensions(ref));

        act(() => {
            MockResizeObserver.instances[0].trigger(800, 600);
        });

        expect(result.current).toEqual({ width: 800, height: 600 });
    });

    it('follows the container resizes (overlay / dropdown layouts)', () => {
        const ref = { current: document.createElement('div') };
        const { result } = renderHook(() => useStageDimensions(ref));

        act(() => {
            MockResizeObserver.instances[0].trigger(800, 600);
        });
        act(() => {
            MockResizeObserver.instances[0].trigger(952, 600);
        });

        expect(result.current).toEqual({ width: 952, height: 600 });
    });

    it('ignores empty measurements (container detached)', () => {
        const ref = { current: document.createElement('div') };
        const { result } = renderHook(() => useStageDimensions(ref));

        act(() => {
            MockResizeObserver.instances[0].trigger(800, 600);
        });
        act(() => {
            MockResizeObserver.instances[0].trigger(0, 0);
        });

        // A 0-size contentRect (e.g. hidden container) must not collapse
        // the Konva Stage.
        expect(result.current).toEqual({ width: 800, height: 600 });
    });

    it('disconnects the observer on unmount', () => {
        const ref = { current: document.createElement('div') };
        const { unmount } = renderHook(() => useStageDimensions(ref));

        unmount();

        expect(MockResizeObserver.instances[0].disconnect).toHaveBeenCalled();
    });
});
