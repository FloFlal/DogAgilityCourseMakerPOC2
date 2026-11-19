import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStageDimensions } from '../../hooks/useStageDimensions';
import { SIDEBAR_WIDTH_PX } from '../../constants/canvasDefaults';

describe('useStageDimensions', () => {
    it('retourne les dimensions de la fenêtre moins la sidebar', () => {
        const { result } = renderHook(() => useStageDimensions());

        expect(result.current.width).toBe(window.innerWidth - SIDEBAR_WIDTH_PX);
        expect(result.current.height).toBe(window.innerHeight);
    });

    it('se met à jour au redimensionnement de la fenêtre', () => {
        const { result } = renderHook(() => useStageDimensions());

        act(() => {
            window.dispatchEvent(new Event('resize'));
        });

        expect(result.current.width).toBe(window.innerWidth - SIDEBAR_WIDTH_PX);
        expect(result.current.height).toBe(window.innerHeight);
    });
});
