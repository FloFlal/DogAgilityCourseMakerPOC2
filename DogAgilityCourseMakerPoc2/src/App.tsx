import React from 'react';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/sidebar';
import { CanvasArea } from './components/canvasArea';
import { useImportNotification } from './hooks/useImportNotification';
import './App.css';

const App: React.FC = () => {
    // Hook pour gérer les notifications d'import
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
            <div style={{ display: 'table', width: '100vw', height: '100vh', tableLayout: 'fixed' }}>
                <div style={{ display: 'table-cell', width: '320px', verticalAlign: 'top' }}>
                    <Sidebar />
                </div>
                <div style={{ display: 'table-cell', verticalAlign: 'top' }}>
                    <CanvasArea />
                </div>
            </div>
        </>
    );
};

export default App;
