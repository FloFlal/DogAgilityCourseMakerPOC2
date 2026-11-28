import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarRail } from '../../components/sidebarRail';

describe('SidebarRail (tablet, US-026)', () => {
    it('renders one icon button per sidebar section', () => {
        render(<SidebarRail isOpen={false} onOpen={() => {}} />);

        const labels = ['Outils', 'Couleurs', 'Langue', 'Import/Export'];

        labels.forEach((label) => {
            const button = screen.getByRole('button', { name: label });
            expect(button).toBeTruthy();
            expect(button.getAttribute('aria-expanded')).toBe('false');
        });
    });

    it('opens the overlay on the clicked section', () => {
        const opened: Array<string | undefined> = [];
        render(
            <SidebarRail
                isOpen={false}
                onOpen={(sectionId) => opened.push(sectionId)}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: 'Couleurs' }));

        expect(opened).toEqual(['color']);
    });

    it('reports the open state through aria-expanded', () => {
        const { rerender } = render(
            <SidebarRail isOpen={false} onOpen={() => {}} />,
        );

        const toggle = screen.getByRole('button', { name: 'Outils' });
        expect(toggle.getAttribute('aria-expanded')).toBe('false');

        rerender(<SidebarRail isOpen onOpen={() => {}} />);
        expect(toggle.getAttribute('aria-expanded')).toBe('true');
    });
});
