import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDrawingStore } from '../store/useDrawingStore';
import {
    selectCurrentColor,
    selectCurrentShapeType,
    selectImportError,
    selectSelectedId,
} from '../store/selectors';
import { Trash2, Download, Upload, AlertTriangle } from 'lucide-react';
import { LanguageSwitcher } from './languageSwitcher';
import { AFrameIcon, DogWalkIcon, JumpIcon, LongJumpIcon, OxerIcon, SemiWeavePolsIcon, SeesawIcon, TireIcon, TunnelIcon, WeavePolsIcon } from './obstacleIcons';
import { CollapsibleSection } from './collapsibleSection';
import type { ObstacleType } from '../types/obstacleTypes';

/**
 * Accordion side panel (US-028): collapsible sections (only one
 * open at a time, tool selection open by default) grouping the
 * tool and color choice, selection actions (deletion), language
 * choice, course import/export and an accessible alert on import error.
 */
export const Sidebar: React.FC = () => {
    const { t } = useTranslation();

    // Atomic selectors: each field is subscribed individually
    const currentColor = useDrawingStore(selectCurrentColor);
    const setCurrentColor = useDrawingStore((state) => state.setCurrentColor);
    const currentShapeType = useDrawingStore(selectCurrentShapeType);
    const setCurrentShapeType = useDrawingStore((state) => state.setCurrentShapeType);
    const selectedId = useDrawingStore(selectSelectedId);
    const deleteShape = useDrawingStore((state) => state.deleteShape);
    const exportToJson = useDrawingStore((state) => state.exportToJson);
    const importFromJson = useDrawingStore((state) => state.importFromJson);
    const importError = useDrawingStore(selectImportError);
    const clearImportError = useDrawingStore((state) => state.clearImportError);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Accordion: only one section open at a time; the tools section is
    // open by default on every load (state intentionally not persisted).
    const [openSection, setOpenSection] = useState<string | null>('tools');

    const toggleSection = (id: string): void => {
        setOpenSection((open) => (open === id ? null : id));
    };

    const handleExport = (): void => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportToJson());
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "myCourse.dacm.json");

        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0];

        // if no file selected, end here
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>): void => {
            const result = event.target?.result;
            if (typeof result === 'string') {
                importFromJson(result);
            }
        };
        reader.readAsText(file);

        // Reset the input so the same file can be imported again
        e.target.value = '';
    };

    const setShapeType = (type: ObstacleType): void => {
        // Arms the requested tool; clicking the active tool again deselects it.
        // The store deselects the current obstacle as soon as a tool is armed.
        setCurrentShapeType(currentShapeType === type ? null : type);
    };

    const toolButtonClass = (type: ObstacleType): string =>
        `flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 ${
        currentShapeType === type ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`;

    // Clear import error when component mounts
    useEffect(() => {
        return () => {
            clearImportError();
        };
    }, [clearImportError]);

    return (
        <aside
            className="w-80 h-screen bg-slate-800 border-r border-slate-700 p-6 flex flex-col select-none z-10"
            aria-label={t('sidebar.ariaLabel')}
        >
            <div>
                <h1 className="text-xl font-bold text-white mb-1">{t('app.title')}</h1>
                <p className="text-sm text-slate-400">{t('app.subtitle')}</p>
            </div>

            {/* Import error display: the store holds a structured i18n code
                (schema/service produce codes, A5 review), translated here in
                the current language; the detailed validation issues stay
                available in a collapsed <details> list. */}
            {importError && (
                <div
                    role="alert"
                    aria-live="assertive"
                    className="flex items-start gap-2 p-3 bg-red-900/30 border border-red-600 rounded-lg"
                >
                    <AlertTriangle size={16} aria-hidden="true" className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-red-300 font-medium">{t('sidebar.importError')}</p>
                        <p className="text-xs text-red-400/80">{t(importError.code)}</p>
                        {importError.issues && importError.issues.length > 0 && (
                            <details className="mt-1">
                                <summary className="text-xs text-red-300 cursor-pointer hover:text-red-200">
                                    {t('import.detailsSummary', { count: importError.issues.length })}
                                </summary>
                                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                                    {importError.issues.map((issue, index) => (
                                        <li key={`${issue.path}-${index}`} className="text-xs text-red-400/80 break-all">
                                            {issue.path}: {t(issue.code)}
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        )}
                    </div>
                    <button
                        onClick={clearImportError}
                        aria-label={t('sidebar.dismissAria')}
                        className="text-xs text-red-300 hover:text-red-200 underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                    >
                        {t('sidebar.dismiss')}
                    </button>
                </div>
            )}

            {/* Sections accordéon : une seule ouverte à la fois */}
            <div className="flex flex-col divide-y divide-slate-700">

                {/*obstacle selector*/}
                <CollapsibleSection
                    id="tools"
                    label={t('sidebar.toolsGroup')}
                    title={t('sidebar.toolsTitle')}
                    isOpen={openSection === 'tools'}
                    onToggle={() => toggleSection('tools')}
                >
                    <div role="group" aria-label={t('sidebar.toolsGroup')} className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setShapeType('jump')}
                            aria-pressed={currentShapeType === 'jump'}
                            className={toolButtonClass('jump')}
                        >
                            <JumpIcon /> {t('sidebar.jump')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShapeType('oxer')}
                            aria-pressed={currentShapeType === 'oxer'}
                            className={toolButtonClass('oxer')}
                        >
                            <OxerIcon /> {t('sidebar.oxer')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShapeType('longJump')}
                            aria-pressed={currentShapeType === 'longJump'}
                            className={toolButtonClass('longJump')}
                        >
                            <LongJumpIcon /> {t('sidebar.longJump')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShapeType('tire')}
                            aria-pressed={currentShapeType === 'tire'}
                            className={toolButtonClass('tire')}
                        >
                            <TireIcon /> {t('sidebar.tire')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShapeType('seesaw')}
                            aria-pressed={currentShapeType === 'seesaw'}
                            className={toolButtonClass('seesaw')}
                        >
                            <SeesawIcon /> {t('sidebar.seesaw')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShapeType('dogWalk')}
                            aria-pressed={currentShapeType === 'dogWalk'}
                            className={toolButtonClass('dogWalk')}
                        >
                            <DogWalkIcon /> {t('sidebar.dogWalk')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShapeType('aFrame')}
                            aria-pressed={currentShapeType === 'aFrame'}
                            className={toolButtonClass('aFrame')}
                        >
                            <AFrameIcon /> {t('sidebar.aFrame')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShapeType('weavePols')}
                            aria-pressed={currentShapeType === 'weavePols'}
                            className={toolButtonClass('weavePols')}
                        >
                            <WeavePolsIcon /> {t('sidebar.weavePols')}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShapeType('semiWeavePols')}
                            aria-pressed={currentShapeType === 'semiWeavePols'}
                            className={toolButtonClass('semiWeavePols')}
                        >
                            <SemiWeavePolsIcon /> {t('sidebar.semiWeavePols')}
                        </button>
                        {/* One dedicated button per tunnel length (US-020),
                            consistent with the rest of the tool grid. */}
                        {(['tunnel6m', 'tunnel5m', 'tunnel4m', 'tunnel3m'] as ObstacleType[]).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setShapeType(type)}
                                aria-pressed={currentShapeType === type}
                                className={toolButtonClass(type)}
                            >
                                <TunnelIcon /> {t(`sidebar.${type}`)}
                            </button>
                        ))}
                    </div>
                </CollapsibleSection>

                {/*color selector*/}
                <CollapsibleSection
                    id="color"
                    label={t('sidebar.colorGroup')}
                    title={t('sidebar.colorTitle')}
                    isOpen={openSection === 'color'}
                    onToggle={() => toggleSection('color')}
                >
                    <div role="group" aria-label={t('sidebar.colorGroup')} className="flex flex-col gap-2">
                        <label
                            htmlFor="obstacle-color"
                            className="sr-only"
                        >
                            {t('sidebar.colorTitle')}
                        </label>
                        <div className="flex items-center gap-3 bg-slate-700 p-2 rounded-lg border border-slate-600">
                            <input
                                type="color"
                                id="obstacle-color"
                                value={currentColor}
                                onChange={(e) => setCurrentColor(e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                            />
                            <span className="font-mono text-sm uppercase text-slate-300">{currentColor}</span>
                        </div>
                    </div>
                </CollapsibleSection>

                {/*language switcher*/}
                <CollapsibleSection
                    id="language"
                    label={t('language.groupLabel')}
                    title={t('sidebar.languageTitle')}
                    isOpen={openSection === 'language'}
                    onToggle={() => toggleSection('language')}
                >
                    <LanguageSwitcher />
                </CollapsibleSection>
            </div>

            {/*obstacle actions : visible dès qu'un obstacle est sélectionné,
               pour garder le bouton de suppression accessible sans manœuvre*/}
            {selectedId && (
                <div className="flex flex-col gap-2 mt-4 p-4 bg-slate-900/50 rounded-lg border border-red-900/30">
                    <span className="text-xs font-semibold text-red-400 uppercase tracking-wider" aria-hidden="true">{t('sidebar.selectedTitle')}</span>
                    <button
                        type="button"
                        onClick={() => {
                            deleteShape(selectedId);
                        }}
                        aria-label={t('sidebar.deleteAria')}
                        className="flex items-center justify-center gap-2 w-full bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white p-2.5 rounded-lg border border-red-500/30 transition text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                    >
                        <Trash2 size={16} aria-hidden="true" /> {t('sidebar.delete')}
                    </button>
                </div>
            )}

            {/*import/export section*/}
            <div className="mt-auto flex flex-col border-t border-slate-700 pt-2">
                <CollapsibleSection
                    id="importExport"
                    label={t('sidebar.importExportGroup')}
                    title={t('sidebar.importExportTitle')}
                    isOpen={openSection === 'importExport'}
                    onToggle={() => toggleSection('importExport')}
                >
                    <div role="group" aria-label={t('sidebar.importExportGroup')} className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white p-2.5 rounded-lg text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                        >
                            <Download size={16} aria-hidden="true" /> {t('sidebar.export')}
                        </button>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white p-2.5 rounded-lg text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                        >
                            <Upload size={16} aria-hidden="true" /> {t('sidebar.import')}
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImport}
                            accept=".json"
                            aria-label={t('sidebar.fileAria')}
                            className="hidden"
                        />
                    </div>
                </CollapsibleSection>
            </div>
        </aside>
    )
};
