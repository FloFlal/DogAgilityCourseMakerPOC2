import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/sidebar';
import { CanvasArea } from './components/canvasArea';
import { useImportNotification } from './hooks/useImportNotification';
import './App.css';

const App: React.FC = () => {
    // Hook handling import notifications
    useImportNotification();

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
            {/* Mise en page flex : sidebar fixe (w-80 = 320 px, équivalent de
                SIDEBAR_WIDTH_PX dans canvasDefaults.ts, consommé par
                useStageDimensions) + canvas fluide sur le reste. */}
            <div className="flex h-screen w-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 min-w-0">
                    <CanvasArea />
                </div>
            </div>
        </>
    );
};

export default App;
