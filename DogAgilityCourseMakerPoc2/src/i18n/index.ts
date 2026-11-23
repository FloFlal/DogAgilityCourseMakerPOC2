import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { fr } from './locales/fr';
import { en } from './locales/en';

/** Languages available in the switcher UI */
export const LANGUAGES = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
] as const;

/** Default language used on first launch (English-first application) */
export const DEFAULT_LANGUAGE = 'en' as const;

const STORAGE_KEY = 'dogagility.language';

/**
 * Initial language, resolved by priority:
 * 1. the persisted user choice (localStorage),
 * 2. the browser language when it is supported (fr → 'fr'),
 * 3. the application default ('en').
 */
export const getInitialLanguage = (): string => {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return stored;
        }
    } catch {
        // Storage unavailable: fall through to browser detection
        return DEFAULT_LANGUAGE;
    }

    const browserLanguage = typeof navigator !== 'undefined' ? navigator.language : undefined;
    if (browserLanguage?.toLowerCase().startsWith(DEFAULT_LANGUAGE)) {
        return DEFAULT_LANGUAGE;
    }
    if (browserLanguage?.toLowerCase().startsWith('fr')) {
        return 'fr';
    }

    return DEFAULT_LANGUAGE;
};

const persistLanguage = (lng: string): void => {
    try {
        window.localStorage.setItem(STORAGE_KEY, lng);
        document.documentElement.lang = lng;
    } catch {
        // Storage unavailable: the change stays active for the session
    }
};

void i18n.use(initReactI18next).init({
    resources: { fr, en },
    lng: getInitialLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
});

// Persist the language choice on every change (no page reload)
i18n.on('languageChanged', (lng) => persistLanguage(lng));

export default i18n;
