import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { fr } from './locales/fr';
import { en } from './locales/en';

/** Languages available in the switcher UI */
export const LANGUAGES = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
] as const;

/** Default language used on first launch */
export const DEFAULT_LANGUAGE = 'fr' as const;

const STORAGE_KEY = 'dogagility.language';

/** Initial language: persisted value otherwise the default language */
export const getInitialLanguage = (): string => {
    try {
        return window.localStorage.getItem(STORAGE_KEY) ?? DEFAULT_LANGUAGE;
    } catch {
        return DEFAULT_LANGUAGE;
    }
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
