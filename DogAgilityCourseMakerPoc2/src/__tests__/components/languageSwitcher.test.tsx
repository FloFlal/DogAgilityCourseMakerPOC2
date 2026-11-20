import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSwitcher } from '../../components/languageSwitcher';
import i18n from '../../i18n';

const STORAGE_KEY = 'dogagility.language';

describe('LanguageSwitcher', () => {
    afterEach(async () => {
        window.localStorage.clear();

        await act(async () => {
            await i18n.changeLanguage('fr');
        });
    });

    it("affiche les deux langues avec l'état aria-pressed", () => {
        render(<LanguageSwitcher />);

        const french = screen.getByRole('button', { name: 'Français' });
        const english = screen.getByRole('button', { name: 'English' });

        expect(french.getAttribute('aria-pressed')).toBe('true');
        expect(english.getAttribute('aria-pressed')).toBe('false');
    });

    it('change la langue sans recharger la page', async () => {
        const user = userEvent.setup();
        render(<LanguageSwitcher />);

        await act(async () => {
            await user.click(screen.getByRole('button', { name: 'English' }));
        });

        expect(screen.getByRole('button', { name: 'English' }).getAttribute('aria-pressed')).toBe('true');
        expect(screen.getByRole('button', { name: 'Français' }).getAttribute('aria-pressed')).toBe('false');
        expect(document.documentElement.lang).toBe('en');
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe('en');
    });

    it("retraduit les textes de l'interface après changement", async () => {
        const user = userEvent.setup();
        render(<LanguageSwitcher />);

        await act(async () => {
            await user.click(screen.getByRole('button', { name: 'English' }));
        });

        expect(i18n.t('sidebar.toolsTitle')).toBe('Tools');

        await act(async () => {
            await i18n.changeLanguage('fr');
        });

        expect(i18n.t('sidebar.toolsTitle')).toBe('Outils');
    });
});
