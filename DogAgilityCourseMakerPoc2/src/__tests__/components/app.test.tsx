import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { useDrawingStore } from '../../store/useDrawingStore';

vi.mock('react-konva', async () => await import('../mocks/reactKonva'));

/** Stubs window.matchMedia for a fixed viewport width class (US-026). */
const stubViewport = (width: number): void => {
    window.matchMedia = ((query: string): MediaQueryList => ({
        matches: query.includes(String(width)),
        media: query,
        onchange: null,
        addListener: (): void => {},
        removeListener: (): void => {},
        addEventListener: (): void => {},
        removeEventListener: (): void => {},
        dispatchEvent: (): boolean => false,
    })) as unknown as typeof window.matchMedia;
};

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

        await user.click(screen.getByRole('button', { name: 'Bascule' }));

        expect(useDrawingStore.getState().currentShapeType).toBe('seesaw');
        expect(screen.getByRole('button', { name: 'Bascule' }).getAttribute('aria-pressed')).toBe('true');

        act(() => {
            useDrawingStore.getState().addShape(10, 20);
        });

        const afterAdd = useDrawingStore.getState();
        expect(afterAdd.obstacles).toHaveLength(1);
        expect(afterAdd.obstacles[0].type).toBe('seesaw');
        // placement does not select the obstacle: selection by obstacle click
        expect(afterAdd.selectedId).toBeNull();
        expect(screen.queryByRole('button', { name: /Supprimer l'obstacle/ })).toBeNull();
        expect(document.querySelectorAll('[data-testid="konva-group"]')).toHaveLength(1);

        act(() => {
            useDrawingStore.getState().setSelectedId(afterAdd.obstacles[0].id);
        });

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

        // fine step by default: +1 px
        expect(useDrawingStore.getState().obstacles[0].x).toBe(11);

        act(() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true }));
        });

        // Shift: fast move of one grid cell (25 px)
        expect(useDrawingStore.getState().obstacles[0].x).toBe(36);

        await user.click(screen.getByRole('group', { name: "Zone de dessin du parcours d'agility" }));
    });

    it('tablette : rail d\'icônes toujours visible, sidebar en overlay (US-026)', () => {
        stubViewport(768);
        render(<App />);

        // The icon rail replaces the static sidebar.
        expect(screen.getByRole('button', { name: 'Outils' })).toBeTruthy();
        expect(screen.queryByRole('group', { name: "Choix de l'outil" })).toBeNull();
        // The drawing area is still there.
        expect(screen.getByRole('group', { name: "Zone de dessin du parcours d'agility" })).toBeTruthy();

        // Tapping a rail icon opens the sidebar overlay on that section.
        fireEvent.click(screen.getByRole('button', { name: 'Outils' }));
        expect(screen.getByRole('group', { name: "Choix de l'outil" })).toBeTruthy();

        // The close button hides the overlay again.
        fireEvent.click(screen.getByRole('button', { name: 'Fermer le panneau d’outils' }));
        expect(screen.queryByRole('group', { name: "Choix de l'outil" })).toBeNull();
    });

    it('mobile : menu déroulant avec aria-expanded (US-026)', () => {
        stubViewport(390);
        render(<App />);

        const toggle = screen.getByRole('button', { name: 'Ouvrir ou fermer le panneau d’outils' });
        expect(toggle.getAttribute('aria-expanded')).toBe('false');
        expect(screen.queryByRole('group', { name: "Choix de l'outil" })).toBeNull();

        fireEvent.click(toggle);

        expect(toggle.getAttribute('aria-expanded')).toBe('true');
        expect(screen.getByRole('group', { name: "Choix de l'outil" })).toBeTruthy();

        fireEvent.click(toggle);

        expect(toggle.getAttribute('aria-expanded')).toBe('false');
        expect(screen.queryByRole('group', { name: "Choix de l'outil" })).toBeNull();
    });
});
