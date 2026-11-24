import { describe, expect, it, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSwitcher } from '../../components/languageSwitcher';
import i18n, { DEFAULT_LANGUAGE, getInitialLanguage } from '../../i18n';

const STORAGE_KEY = 'dogagility.language';

describe('LanguageSwitcher', () => {
    afterEach(async () => {
        if (typeof window.localStorage?.clear === 'function') {
            window.localStorage.clear();
        }

        await act(async () => {
            await i18n.changeLanguage('fr');
        });
    });

    it('shows both languages with the aria-pressed state', () => {
        render(<LanguageSwitcher />);

        const french = screen.getByRole('button', { name: 'Français' });
        const english = screen.getByRole('button', { name: 'English' });

        expect(french.getAttribute('aria-pressed')).toBe('true');
        expect(english.getAttribute('aria-pressed')).toBe('false');
    });

    it('changes the language without reloading the page', async () => {
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

    it('retranslates UI texts after a change', async () => {
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

describe('getInitialLanguage (US-016 — English default)', () => {
    it('falls back to English when no preference is stored', () => {
        window.localStorage.removeItem(STORAGE_KEY);

        expect(getInitialLanguage()).toBe(DEFAULT_LANGUAGE);
        expect(DEFAULT_LANGUAGE).toBe('en');
    });

    it('keeps the persisted user choice over anything else', () => {
        window.localStorage.setItem(STORAGE_KEY, 'fr');

        expect(getInitialLanguage()).toBe('fr');
    });

    it('follows a French browser language when nothing is stored', () => {
        window.localStorage.removeItem(STORAGE_KEY);
        vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('fr-FR');

        expect(getInitialLanguage()).toBe('fr');

        vi.restoreAllMocks();
    });

    it('follows the default for an unsupported browser language', () => {
        window.localStorage.removeItem(STORAGE_KEY);
        vi.spyOn(window.navigator, 'language', 'get').mockReturnValue('de-DE');

        expect(getInitialLanguage()).toBe('en');

        vi.restoreAllMocks();
    });
});
