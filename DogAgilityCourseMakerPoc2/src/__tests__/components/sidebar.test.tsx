import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../../components/sidebar';
import { useDrawingStore } from '../../store/useDrawingStore';

describe('Sidebar tunnel tools (US-020)', () => {
    beforeEach(() => {
        useDrawingStore.setState({
            obstacles: [],
            selectedId: null,
            currentColor: '#3b82f6',
            currentShapeType: null,
            importError: null,
        });
    });

    it('offers one dedicated button per tunnel length', () => {
        render(<Sidebar />);

        for (const label of [/tunnel 6 m/i, /tunnel 5 m/i, /tunnel 4 m/i, /tunnel 3 m/i]) {
            expect(screen.getByRole('button', { name: label })).toBeTruthy();
        }
    });

    it('arms the matching tunnel tool when a tunnel button is clicked', () => {
        render(<Sidebar />);

        fireEvent.click(screen.getByRole('button', { name: /tunnel 5 m/i }));

        expect(useDrawingStore.getState().currentShapeType).toBe('tunnel5m');
        expect(screen.getByRole('button', { name: /tunnel 5 m/i }).getAttribute('aria-pressed')).toBe('true');
    });
});

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

    it('les sections sont des groupes labellisés (après ouverture)', () => {
        render(<Sidebar />);

        expect(screen.getByRole('group', { name: /choix de l'outil/i })).toBeTruthy();

        // Sections closed by default: open them via their accordion title
        fireEvent.click(screen.getByRole('button', { name: 'Couleurs' }));
        expect(screen.getByRole('group', { name: /choix de la couleur/i })).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: 'Import/Export' }));
        expect(screen.getByRole('group', { name: /import et export/i })).toBeTruthy();
    });

    it("chaque bouton d'outil affiche le schéma de l'obstacle (décoratif)", () => {
        render(<Sidebar />);

        for (const type of ['jump', 'oxer', 'longJump', 'seesaw', 'dogWalk', 'aFrame', 'tire', 'weavePols', 'semiWeavePols']) {
            const icon = screen.getByTestId(`obstacle-icon-${type}`);

            expect(icon.getAttribute('aria-hidden')).toBe('true');
        }
    });

    it("l'accordéon ouvre une seule section à la fois (outils ouvert par défaut)", () => {
        render(<Sidebar />);

        expect(screen.getByRole('button', { name: 'Outils' }).getAttribute('aria-expanded')).toBe('true');
        expect(screen.getByRole('button', { name: 'Couleurs' }).getAttribute('aria-expanded')).toBe('false');

        fireEvent.click(screen.getByRole('button', { name: 'Couleurs' }));

        expect(screen.getByRole('button', { name: 'Couleurs' }).getAttribute('aria-expanded')).toBe('true');
        expect(screen.getByRole('button', { name: 'Outils' }).getAttribute('aria-expanded')).toBe('false');
    });

    it("re-cliquer le titre ouvert referme la section (aucune ouverte)", () => {
        render(<Sidebar />);

        fireEvent.click(screen.getByRole('button', { name: 'Outils' }));

        expect(screen.getByRole('button', { name: 'Outils' }).getAttribute('aria-expanded')).toBe('false');
    });

    it("l'erreur d'import est une alerte accessible avec bouton labellisé", () => {
        useDrawingStore.setState({ importError: { code: 'import.errors.invalidJson' } });
        render(<Sidebar />);

        const alert = screen.getByRole('alert');

        // Le code i18n structuré est traduit dans la langue de la suite (fr).
        expect(alert.textContent).toContain('Syntaxe JSON invalide');
        expect(screen.getByRole('button', { name: /fermer le message/i })).toBeTruthy();
    });

    it("l'erreur de validation liste ses détails repliés (path + message traduit)", () => {
        useDrawingStore.setState({
            importError: {
                code: 'import.errors.validationFailed',
                issues: [
                    { path: '0.width', code: 'import.errors.widthPositive' },
                    { path: '1.fill', code: 'import.errors.fillHexColor' },
                ],
            },
        });
        render(<Sidebar />);

        const alert = screen.getByRole('alert');

        expect(alert.textContent).toContain('Le fichier de parcours contient des données invalides');
        const summary = screen.getByText(/Détails de la validation \(2\)/);
        const details = summary.closest('details');
        expect(details).toBeTruthy();
        // Details are collapsed by default: the summary click expands them.
        expect(details?.hasAttribute('open')).toBe(false);

        fireEvent.click(summary);

        expect(details?.hasAttribute('open')).toBe(true);
        // Each issue keeps its dotted path and its translated message.
        expect(screen.getByText(/0\.width:/)).toBeTruthy();
        expect(screen.getByText(/La largeur de l’obstacle doit être positive/)).toBeTruthy();
        expect(screen.getByText(/1\.fill:/)).toBeTruthy();
        expect(screen.getByText(/La couleur de remplissage doit être un code hexadécimal valide/)).toBeTruthy();
    });

    it('le champ couleur a un label associé', () => {
        render(<Sidebar />);

        fireEvent.click(screen.getByRole('button', { name: 'Couleurs' }));

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

describe('Sidebar field section (US-033)', () => {
    beforeEach(() => {
        useDrawingStore.setState({
            obstacles: [],
            selectedId: null,
            currentShapeType: null,
            importError: null,
            fieldWidthMeters: 20,
            fieldLengthMeters: 40,
            cellSizeMeters: 1,
        });
    });

    it('exposes the field dimensions with the default official ring (20 m x 40 m)', () => {
        render(<Sidebar />);

        const width = screen.getByLabelText(/Largeur \(m\)/i) as HTMLInputElement;
        const length = screen.getByLabelText(/Longueur \(m\)/i) as HTMLInputElement;

        expect(width.value).toBe('20');
        expect(length.value).toBe('40');
    });

    it('updates the field dimensions through the inputs', () => {
        render(<Sidebar />);

        const width = screen.getByLabelText(/Largeur \(m\)/i) as HTMLInputElement;
        const length = screen.getByLabelText(/Longueur \(m\)/i) as HTMLInputElement;

        fireEvent.change(width, { target: { value: '15' } });
        fireEvent.change(length, { target: { value: '30' } });

        expect(useDrawingStore.getState().fieldWidthMeters).toBe(15);
        expect(useDrawingStore.getState().fieldLengthMeters).toBe(30);
    });

    it('updates the grid cell size in whole meters', () => {
        render(<Sidebar />);

        const cell = screen.getByLabelText(/Cellule de grille \(m\)/i) as HTMLInputElement;

        fireEvent.change(cell, { target: { value: '2' } });

        expect(useDrawingStore.getState().cellSizeMeters).toBe(2);
    });
});
