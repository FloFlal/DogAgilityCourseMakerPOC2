import { useEffect, useState } from 'react';

/**
 * Layout breakpoints (US-026):
 * - desktop (>= 1024 px): static sidebar in the flex row;
 * - tablet (>= 768 px): collapsed sidebar (icon rail) with the full
 *   sidebar available as an overlay panel;
 * - mobile (< 768 px): the sidebar becomes a dropdown menu.
 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

/** Minimum width for the tablet layout (px). */
export const TABLET_MIN_PX = 768;
/** Minimum width for the desktop layout (px). */
export const DESKTOP_MIN_PX = 1024;

/**
 * Resolves the current breakpoint from the viewport width.
 * Pure helper (testable): reads window.matchMedia so tests can stub it.
 */
export function resolveBreakpoint(): Breakpoint {
    if (window.matchMedia(`(min-width: ${DESKTOP_MIN_PX}px)`).matches) {
        return 'desktop';
    }

    if (window.matchMedia(`(min-width: ${TABLET_MIN_PX}px)`).matches) {
        return 'tablet';
    }

    return 'mobile';
}

/**
 * Hook returning the current responsive breakpoint ('desktop', 'tablet'
 * or 'mobile') and updating on viewport changes (no page reload).
 */
export function useBreakpoint(): Breakpoint {
    const [breakpoint, setBreakpoint] = useState<Breakpoint>(resolveBreakpoint);

    useEffect((): (() => void) => {
        const queries = [
            window.matchMedia(`(min-width: ${DESKTOP_MIN_PX}px)`),
            window.matchMedia(`(min-width: ${TABLET_MIN_PX}px)`),
        ];
        const handleChange = (): void => {
            setBreakpoint(resolveBreakpoint());
        };

        queries.forEach((query) => query.addEventListener('change', handleChange));

        return (): void => {
            queries.forEach((query) => query.removeEventListener('change', handleChange));
        };
    }, []);

    return breakpoint;
}
