import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GridLayer } from '../../components/canvas/gridLayer';

vi.mock('react-konva', async () => await import('./../mocks/reactKonva'));

describe('GridLayer', () => {
    beforeEach(() => {
        window.innerWidth = 1024;
        window.innerHeight = 768;
    });

    it('génère les lignes verticales et horizontales selon la grille', () => {
        render(<GridLayer width={1000} height={700} gridSize={100} />);

        const lines = screen.getAllByTestId('konva-line');

        // verticales : x = 0..1000 (pas 100) -> 11 ; horizontales : y = 0..700 -> 8
        expect(lines).toHaveLength(19);

        const firstVertical = lines[0];
        expect(firstVertical.getAttribute('data-x')).toBe('0');
        expect(JSON.parse(firstVertical.getAttribute('data-points') ?? '[]')).toEqual([0, 0, 0, 700]);
    });

    it('ne génère qu\'une ligne par axe quand la grille dépasse la zone', () => {
        render(<GridLayer width={50} height={50} gridSize={100} />);

        expect(screen.getAllByTestId('konva-line')).toHaveLength(2);
    });

    it('se redessine quand la taille de grille change', () => {
        const { rerender } = render(<GridLayer width={100} height={100} gridSize={25} />);

        expect(screen.getAllByTestId('konva-line')).toHaveLength(10);

        rerender(<GridLayer width={100} height={100} gridSize={50} />);

        expect(screen.getAllByTestId('konva-line')).toHaveLength(6);
    });
});
