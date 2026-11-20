import React from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../i18n';

const switcherButtonClass = (active: boolean): string =>
    `px-3 py-1.5 rounded-lg border text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
    active ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`;

/**
 * Sélecteur de langue : bascule l'interface en français ou en anglais
 * sans rechargement de la page (react-i18next réagit au changement).
 */
export const LanguageSwitcher: React.FC = () => {
    const { t, i18n } = useTranslation();
    const activeLanguage = i18n.language;

    const handleChangeLanguage = async (code: string): Promise<void> => {
        await i18n.changeLanguage(code);
    };

    return (
        <div role="group" aria-label={t('language.groupLabel')} className="flex items-center gap-2">
            {LANGUAGES.map((language) => (
                <button
                    key={language.code}
                    type="button"
                    onClick={() => {
                        void handleChangeLanguage(language.code);
                    }}
                    aria-pressed={activeLanguage === language.code}
                    className={switcherButtonClass(activeLanguage === language.code)}
                >
                    {language.label}
                </button>
            ))}
        </div>
    );
};
