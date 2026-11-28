import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import { Menu } from 'lucide-react';
import { Sidebar } from './components/sidebar';
import { SidebarRail } from './components/sidebarRail';
import { CanvasArea } from './components/canvasArea';
import { useImportNotification } from './hooks/useImportNotification';
import { useBreakpoint } from './hooks/useBreakpoint';
import './App.css';

const App: React.FC = () => {
    const { t } = useTranslation();

    // Hook handling import notifications
    useImportNotification();

    // Responsive layout (US-026): static sidebar on desktop, collapsed
    // icon rail + overlay panel on tablet, dropdown menu on mobile.
    const breakpoint = useBreakpoint();
    const [panelOpen, setPanelOpen] = useState(false);
    const [panelSection, setPanelSection] = useState<string | null>(null);

    const openPanel = (sectionId?: string): void => {
        setPanelSection(sectionId ?? null);
        setPanelOpen(true);
    };
    const closePanel = (): void => {
        setPanelOpen(false);
    };

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1e293b',
                        color: '#f1f5f9',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
            {/* Desktop: static sidebar (w-80 = 320 px, equivalent of
                SIDEBAR_WIDTH_PX in canvasDefaults.ts) + fluid canvas. */}
            {breakpoint === 'desktop' && (
                <div className="flex h-screen w-screen overflow-hidden">
                    <Sidebar />
                    <div className="flex-1 min-w-0">
                        <CanvasArea />
                    </div>
                </div>
            )}

            {/* Tablet: collapsed icon rail always visible + full sidebar
                as an overlay panel over the drawing (canvas keeps its
                size: the overlay is absolutely positioned). */}
            {breakpoint === 'tablet' && (
                <div className="flex h-screen w-screen overflow-hidden">
                    <SidebarRail isOpen={panelOpen} onOpen={openPanel} />
                    <div className="relative flex-1 min-w-0">
                        <CanvasArea />
                        {panelOpen && (
                            <div className="absolute inset-y-0 left-0 z-20 shadow-2xl">
                                <Sidebar
                                    onClose={closePanel}
                                    initialOpenSection={panelSection}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Mobile: the sidebar becomes a dropdown menu under a compact
                header; the canvas takes the remaining full width. */}
            {breakpoint === 'mobile' && (
                <div className="flex h-screen w-screen flex-col overflow-hidden">
                    <header className="flex items-center justify-between gap-2 px-4 py-2 bg-slate-800 border-b border-slate-700 z-30">
                        <h1 className="text-base font-bold text-white truncate">{t('app.title')}</h1>
                        <button
                            type="button"
                            onClick={() => (panelOpen ? closePanel() : openPanel())}
                            aria-expanded={panelOpen}
                            aria-controls="mobile-menu-panel"
                            aria-label={t('sidebar.menuToggleAria')}
                            className="flex items-center gap-2 p-2 text-slate-200 hover:text-white hover:bg-slate-700 rounded-lg transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
                        >
                            <Menu size={20} aria-hidden="true" /> {t('sidebar.menuButton')}
                        </button>
                    </header>
                    <div className="relative flex-1 min-h-0">
                        <CanvasArea />
                        {panelOpen && (
                            <div
                                id="mobile-menu-panel"
                                className="absolute inset-x-0 top-0 z-20 max-h-full overflow-y-auto shadow-2xl"
                            >
                                <Sidebar
                                    onClose={closePanel}
                                    initialOpenSection={panelSection}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default App;
