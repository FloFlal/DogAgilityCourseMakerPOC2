import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
    /** Unique identifier: used as the `aria-controls` anchor of the content. */
    id: string;
    /** Accessible name of the content region (independent of the visible title). */
    label: string;
    /** Visible title of the toggle button. */
    title: string;
    /** Section open? (accordion: only one at a time on the sidebar side) */
    isOpen: boolean;
    /** Toggle the open/closed state of the section. */
    onToggle: () => void;
    children: React.ReactNode;
}

/**
 * Collapsible section (accordion, US-028): a clickable title exposes
 * `aria-expanded` and `aria-controls`; the content is hidden (display none)
 * when the section is closed and exposes a named region when visible.
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
