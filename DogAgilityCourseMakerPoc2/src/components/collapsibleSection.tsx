import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
    /** Identifiant unique : sert d'ancrage `aria-controls` du contenu. */
    id: string;
    /** Nom accessible de la région de contenu (indépendant du titre visible). */
    label: string;
    /** Titre visible du bouton de bascule. */
    title: string;
    /** Section ouverte ? (accordéon : une seule à la fois côté sidebar) */
    isOpen: boolean;
    /** Basculer l'état ouvert/fermé de la section. */
    onToggle: () => void;
    children: React.ReactNode;
}

/**
 * Section rétractable (accordéon, US-028) : un titre cliquable expose
 * `aria-expanded` et `aria-controls`, le contenu est masqué (display none)
 * quand la section est fermée et expose une région nommée quand il est visible.
 */
export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    id,
    label,
    title,
    isOpen,
    onToggle,
    children,
}) => (
    <section className="flex flex-col">
        <h2>
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-controls={`${id}-content`}
                className="flex w-full items-center justify-between py-3 text-sm font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            >
                {title}
                <span aria-hidden="true" className="flex">
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </span>
            </button>
        </h2>
        <div
            id={`${id}-content`}
            role="region"
            aria-label={label}
            className={`flex flex-col gap-2 ${isOpen ? 'pb-4' : 'hidden'}`}
        >
            {children}
        </div>
    </section>
);
