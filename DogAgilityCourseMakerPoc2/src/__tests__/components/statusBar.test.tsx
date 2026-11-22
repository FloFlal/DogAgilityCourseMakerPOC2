import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { StatusBar } from '../../components/statusBar';
import { useDrawingStore } from '../../store/useDrawingStore';
import type { Obstacle } from '../../types/obstacleTypes';

const makeObstacle = (id: string, type: Obstacle['type'] = 'jump'): Obstacle => ({
    id,
    type,
    x: 120.6,
    y: 80.3,
    width: 40,
    height: 230,
    fill: '#3b82f6',
    rotation: 0,
});

describe('StatusBar (bandeau d\u2019informations, US-029)', () => {
    beforeEach(() => {
        useDrawingStore.setState({ obstacles: [], selectedId: null, importError: null });
    });

    it("affiche le nombre d'obstacles même sans sélection", () => {
        useDrawingStore.setState({ obstacles: [makeObstacle('a'), makeObstacle('b')] });

        render(<StatusBar />);

        expect(screen.getByTestId('status-count').textContent).toContain('2');
        expect(screen.queryByTestId('status-selected')).toBeNull();
    });

    it('affiche le type traduit et la position arrondie de la sélection', () => {
        useDrawingStore.setState({ obstacles: [makeObstacle('a')], selectedId: 'a' });

        render(<StatusBar />);

        const selected = screen.getByTestId('status-selected');

        // type traduit (fr par défaut)
        expect(selected.textContent).toContain('Haie');
        // positions arrondies à l'entier
        expect(selected.textContent).toContain('121');
        expect(selected.textContent).toContain('80');
    });

    it('se met à jour en temps réel (ajout, sélection, suppression)', () => {
        render(<StatusBar />);

        expect(screen.getByTestId('status-count').textContent).toContain('0');

        act(() => {
            useDrawingStore.getState().addShape(10, 20);
        });

        expect(screen.getByTestId('status-count').textContent).toContain('1');

        const id = useDrawingStore.getState().obstacles[0].id;

        act(() => {
            useDrawingStore.getState().setSelectedId(id);
        });

        expect(screen.getByTestId('status-selected')).toBeTruthy();

        act(() => {
            useDrawingStore.getState().deleteShape(id);
        });

        // la suppression retire aussi la sélection du bandeau
        expect(screen.queryByTestId('status-selected')).toBeNull();
        expect(screen.getByTestId('status-count').textContent).toContain('0');
    });
});
