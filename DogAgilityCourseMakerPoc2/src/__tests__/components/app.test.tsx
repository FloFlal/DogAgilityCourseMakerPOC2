import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { useDrawingStore } from '../../store/useDrawingStore';

vi.mock('react-konva', async () => await import('../mocks/reactKonva'));

const OBSTACLE_UUID = '11111111-1111-4111-8111-111111111111';

const validCourse = [
    {
        id: OBSTACLE_UUID,
        type: 'jump',
        x: 10,
        y: 20,
        width: 25,
        height: 25,
        fill: '#3b82f6',
        rotation: 0,
    },
];

describe('App (intégration)', () => {
    beforeEach(() => {
        useDrawingStore.setState({
            obstacles: [],
            selectedId: null,
            importError: null,
            currentShapeType: 'jump',
            currentColor: '#3b82f6',
        });
    });

    it("monte l'application avec la sidebar, la zone de dessin et aucune obstacle", () => {
        render(<App />);

        expect(screen.getByRole('group', { name: "Zone de dessin du parcours d'agility" })).toBeTruthy();
        expect(screen.getByRole('group', { name: "Choix de l'outil" })).toBeTruthy();
        expect(screen.getByRole('group', { name: 'Choix de la couleur' })).toBeTruthy();
        expect(useDrawingStore.getState().obstacles).toHaveLength(0);
    });

    it('permet de choisir un outil puis ajouter et supprimer un obstacle', async () => {
        const user = userEvent.setup();
        render(<App />);

        await user.click(screen.getByRole('button', { name: 'See Saw' }));

        expect(useDrawingStore.getState().currentShapeType).toBe('seesaw');
        expect(screen.getByRole('button', { name: 'See Saw' }).getAttribute('aria-pressed')).toBe('true');

        act(() => {
            useDrawingStore.getState().addShape(10, 20);
        });

        const afterAdd = useDrawingStore.getState();
        expect(afterAdd.obstacles).toHaveLength(1);
        expect(afterAdd.obstacles[0].type).toBe('seesaw');
        expect(afterAdd.selectedId).toBe(afterAdd.obstacles[0].id);
        expect(document.querySelectorAll('[data-testid="konva-group"]')).toHaveLength(1);

        await user.click(screen.getByRole('button', { name: /Supprimer l'obstacle/ }));

        const afterDelete = useDrawingStore.getState();
        expect(afterDelete.obstacles).toHaveLength(0);
        expect(afterDelete.selectedId).toBeNull();
    });

    it('importe un parcours, sélectionne un obstacle et le déplace au clavier', async () => {
        const user = userEvent.setup();
        render(<App />);

        act(() => {
            useDrawingStore.getState().importFromJson(JSON.stringify(validCourse));
        });

        expect(useDrawingStore.getState().obstacles).toHaveLength(1);
        expect(useDrawingStore.getState().importError).toBeNull();

        const group = document.querySelector(
            `[data-testid="konva-group"][data-id="${OBSTACLE_UUID}"]`,
        );
        expect(group).toBeTruthy();

        await user.click(group as HTMLElement);

        expect(useDrawingStore.getState().selectedId).toBe(OBSTACLE_UUID);

        act(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        });

        expect(useDrawingStore.getState().obstacles[0].x).toBe(35);

        await user.click(screen.getByRole('group', { name: "Zone de dessin du parcours d'agility" }));
    });
});
