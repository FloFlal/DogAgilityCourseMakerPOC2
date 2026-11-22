import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../../components/sidebar';
import { useDrawingStore } from '../../store/useDrawingStore';

describe('Sidebar accessibilité', () => {
    beforeEach(() => {
        useDrawingStore.setState({
            obstacles: [],
            selectedId: null,
            currentColor: '#3b82f6',
            currentShapeType: 'jump',
            importError: null,
        });
    });

    it("les boutons d'outils exposent aria-pressed", () => {
        render(<Sidebar />);

        const jump = screen.getByRole('button', { name: /haie/i });

        expect(jump.getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByRole('button', { name: /bascule/i }).getAttribute('aria-pressed')).toBe('false');
    });

    it("aria-pressed bascule quand l'outil change", () => {
        render(<Sidebar />);

        const seesaw = screen.getByRole('button', { name: /bascule/i });

        fireEvent.click(seesaw);

        expect(seesaw.getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByRole('button', { name: /haie/i }).getAttribute('aria-pressed')).toBe('false');
    });

    it("changer d'outil désélectionne l'obstacle courant", () => {
        useDrawingStore.setState({ obstacles: [], selectedId: 'obstacle-1', currentShapeType: 'jump' });
        render(<Sidebar />);

        expect(screen.getByRole('button', { name: /supprimer l'obstacle/i })).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: /bascule/i }));

        expect(useDrawingStore.getState().selectedId).toBeNull();
        expect(useDrawingStore.getState().currentShapeType).toBe('seesaw');
        expect(screen.queryByRole('button', { name: /supprimer l'obstacle/i })).toBeNull();
    });

    it("re-cliquer l'outil actif le désélectionne", () => {
        render(<Sidebar />);

        const seesaw = screen.getByRole('button', { name: /bascule/i });

        fireEvent.click(seesaw);
        fireEvent.click(seesaw);

        expect(useDrawingStore.getState().currentShapeType).toBeNull();
        expect(seesaw.getAttribute('aria-pressed')).toBe('false');
        expect(screen.getByRole('button', { name: /haie/i }).getAttribute('aria-pressed')).toBe('false');
    });

    it("armer un outil désélectionne l'obstacle courant", () => {
        useDrawingStore.setState({ obstacles: [], selectedId: 'obstacle-1', currentShapeType: null });
        render(<Sidebar />);

        expect(screen.queryByRole('button', { name: /supprimer l'obstacle/i })).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: /bascule/i }));

        expect(useDrawingStore.getState().selectedId).toBeNull();
    });

    it('les sections sont des groupes labellisés', () => {
        render(<Sidebar />);

        expect(screen.getByRole('group', { name: /choix de l'outil/i })).toBeTruthy();
        expect(screen.getByRole('group', { name: /choix de la couleur/i })).toBeTruthy();
        expect(screen.getByRole('group', { name: /import et export/i })).toBeTruthy();
    });

    it("l'erreur d'import est une alerte accessible avec bouton labellisé", () => {
        useDrawingStore.setState({ importError: 'Invalid JSON syntax' });
        render(<Sidebar />);

        const alert = screen.getByRole('alert');

        expect(alert.textContent).toContain('Invalid JSON syntax');
        expect(screen.getByRole('button', { name: /fermer le message/i })).toBeTruthy();
    });

    it('le champ couleur a un label associé', () => {
        render(<Sidebar />);

        const label = document.querySelector('label[for="obstacle-color"]');
        const input = document.getElementById('obstacle-color');

        expect(label).toBeTruthy();
        expect(input?.tagName).toBe('INPUT');
    });

    it('le bouton de suppression est accessible par son nom', () => {
        useDrawingStore.setState({ obstacles: [], selectedId: 'a' });
        render(<Sidebar />);

        expect(screen.getByRole('button', { name: /supprimer l'obstacle/i })).toBeTruthy();
    });

    it("les icônes décoratives sont cachées aux lecteurs d'écran", () => {
        render(<Sidebar />);

        const icons = document.querySelectorAll('aside svg[aria-hidden="true"]');

        expect(icons.length).toBeGreaterThan(0);
    });
});
