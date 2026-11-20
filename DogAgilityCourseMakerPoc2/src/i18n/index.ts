import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { fr } from './locales/fr';
import { en } from './locales/en';

/** Langues disponibles dans l'interface du sélecteur */
export const LANGUAGES = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
] as const;

/** Langue par défaut utilisée au premier lancement */
export const DEFAULT_LANGUAGE = 'fr' as const;

const STORAGE_KEY = 'dogagility.language';

/** Langue initiale : valeur persistée sinon langue par défaut */
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
        // Stockage indisponible : le changement reste actif pour la session
    }
};

void i18n.use(initReactI18next).init({
    resources: { fr, en },
    lng: getInitialLanguage(),
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: { escapeValue: false },
});

// Persistance du choix de langue à chaque changement (sans rechargement de page)
i18n.on('languageChanged', (lng) => persistLanguage(lng));

export default i18n;
