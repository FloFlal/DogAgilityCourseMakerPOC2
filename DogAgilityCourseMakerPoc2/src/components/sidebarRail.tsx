import { useTranslation } from 'react-i18next';
import { FileDown, Languages, Palette, Ruler, Wrench } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Tablet collapsed sidebar (US-026): a narrow icon rail with the section
 * icons always visible. Tapping an icon opens the full sidebar as an
 * overlay panel on that section; the toggle button carries aria-expanded
 * so assistive technologies report the panel state.
 */

interface SidebarRailProps {
    /** Whether the overlay sidebar panel is currently open. */
    isOpen: boolean;
    /** Opens the overlay sidebar panel (optionally on a given section). */
    onOpen: (sectionId?: string) => void;
}

const RAIL_SECTIONS: Array<{ id: string; icon: LucideIcon }> = [
    { id: 'tools', icon: Wrench },
    { id: 'field', icon: Ruler },
    { id: 'color', icon: Palette },
    { id: 'language', icon: Languages },
    { id: 'importExport', icon: FileDown },
];

export const SidebarRail: React.FC<SidebarRailProps> = ({ isOpen, onOpen }) => {
    const { t } = useTranslation();

    return (
        <nav
            aria-label={t('sidebar.ariaLabel')}
            className="w-14 h-full bg-slate-800 border-r border-slate-700 flex flex-col items-center py-4 gap-2 select-none z-10"
        >
            {RAIL_SECTIONS.map(({ id, icon: Icon }) => (
                <button
                    key={id}
                    type="button"
                    onClick={() => onOpen(id)}
                    aria-expanded={isOpen}
                    aria-label={t(`sidebar.${id}Title`)}
                    title={t(`sidebar.${id}Title`)}
                    className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                >
                    <Icon size={20} aria-hidden="true" />
                </button>
            ))}
        </nav>
    );
};
