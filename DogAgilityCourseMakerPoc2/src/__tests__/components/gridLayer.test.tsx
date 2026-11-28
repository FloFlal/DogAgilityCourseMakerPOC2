import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GridLayer } from '../../components/canvas/gridLayer';

vi.mock('react-konva', async () => await import('./../mocks/reactKonva'));

// US-033: the grid layer draws the field rectangle, the grid lines
// inside it only, and the dimension rulers in the dead zone.
// Scale: 1 m = 40 px (METERS_TO_PX = 100 / OBSTACLE_RATIO).

describe('GridLayer (US-033 field)', () => {
    // 4 m x 3 m field with 1 m cells: 800... no, simplified px scale below.
    const props = { fieldX: 60, fieldY: 60, fieldWidth: 160, fieldHeight: 120, cellPx: 40 };

    it('dessine le rectangle peripherique du terrain', () => {
        render(<GridLayer {...props} />);

        const rect = screen.getByTestId('konva-rect');

        expect(rect.getAttribute('data-x')).toBe('60');
        expect(rect.getAttribute('data-y')).toBe('60');
        expect(rect.getAttribute('data-width')).toBe('160');
        expect(rect.getAttribute('data-height')).toBe('120');
    });

    it('genere les lignes de grille uniquement a l\'interieur du terrain', () => {
        render(<GridLayer {...props} />);

        const lines = screen.getAllByTestId('konva-line');

        // vertical: x = 60..220 (step 40) -> 5; horizontal: y = 60..180 -> 4
        expect(lines).toHaveLength(9);

        const firstVertical = lines[0];
        expect(firstVertical.getAttribute('data-x')).toBe('60');
        expect(firstVertical.getAttribute('data-y')).toBe('60');
        expect(JSON.parse(firstVertical.getAttribute('data-points') ?? '[]')).toEqual([0, 0, 0, 120]);
    });

    it('affiche les cotes des lignes horizontales a gauche en partant du haut-gauche, sans le 0 du coin', () => {
        render(<GridLayer {...props} />);

        const rowLabels = screen.getAllByTestId('konva-text').filter((node) => node.getAttribute('data-x') === '20');

        // 4 horizontal lines; the origin (0) is shown once by the column
        // ruler in the top-left corner, so the row ruler starts at 1 m.
        expect(rowLabels.map((node) => node.getAttribute('data-text'))).toEqual(['1', '2', '3']);
        expect(rowLabels[0].getAttribute('data-y')).toBe('94');
    });

    it('affiche les cotes des lignes verticales en haut, centrees sur leurs lignes', () => {
        render(<GridLayer {...props} />);

        const colLabels = screen.getAllByTestId('konva-text').filter((node) => node.getAttribute('data-y') === '46');

        // 5 vertical lines (x = 0, 1, 2, 3, 4 m), labels centered on their
        // line (label box width 24 px) above the field.
        expect(colLabels).toHaveLength(5);
        expect(colLabels.map((node) => node.getAttribute('data-text'))).toEqual(['0', '1', '2', '3', '4']);
        expect(colLabels[0].getAttribute('data-x')).toBe('48');
        expect(colLabels[1].getAttribute('data-x')).toBe('88');
    });

    it('suit la taille de cellule (metres entiers) pour la grille et les cotes', () => {
        // 4 m x 3 m field with 2 m cells: 3 vertical lines, 2 horizontal lines,
        // labels every 2 m.
        render(<GridLayer fieldX={60} fieldY={60} fieldWidth={160} fieldHeight={120} cellPx={80} />);

        const lines = screen.getAllByTestId('konva-line');
        expect(lines).toHaveLength(5);

        const rowLabels = screen.getAllByTestId('konva-text').filter((node) => node.getAttribute('data-x') === '20');
        // The origin (0) is shown once, by the column ruler.
        expect(rowLabels.map((node) => node.getAttribute('data-text'))).toEqual(['2']);
    });
});
