import React, { useRef, useEffect } from 'react';
import { useDrawingStore } from '../store/useDrawingStore';
import { Square, Circle, Trash2, Download, Upload, AlertTriangle } from 'lucide-react';
import { ObstacleType } from '../types/obstacleTypes';

export const Sidebar: React.FC = () => {
    const {
        currentColor, 
        setCurrentColor, 
        currentShapeType, 
        setCurrentShapeType, 
        selectedId, 
        deleteShape, 
        exportToJson, 
        importFromJson,
        importError,
        clearImportError
    } = useDrawingStore();

    const fileInputRef = useRef<HTMLInputElement>(null);

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
        setCurrentShapeType(type);
    };

    // Clear import error when component mounts
    useEffect(() => {
        return () => {
            clearImportError();
        };
    }, [clearImportError]);

    return (
        <div className="w-80 h-screen bg-slate-800 border-r border-slate-700 p-6 flex flex-col gap-6 select-none z-10">
            <div>
                <h1 className="text-xl font-bold text-white mb-1">Dog Agility Course Maker</h1>
                <p className="text-sm text-slate-400">POC React + Konva</p>
            </div>

            {/* Import error display */}
            {importError && (
                <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-600 rounded-lg">
                    <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm text-red-300 font-medium">Import Error</p>
                        <p className="text-xs text-red-400/80 truncate">{importError}</p>
                    </div>
                    <button 
                        onClick={clearImportError}
                        className="text-xs text-red-300 hover:text-red-200 underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/*obstacle selector*/}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Tools</label>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => setShapeType('jump')} 
                        className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition ${currentShapeType === 'jump' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}
                    >
                        <Square size={16} /> Jump
                    </button>
                    <button 
                        onClick={() => setShapeType('seesaw')} 
                        className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition ${currentShapeType === 'seesaw' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}
                    >
                        <Circle size={16} /> See Saw
                    </button>
                    <button 
                        onClick={() => setShapeType('dogWalk')} 
                        className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition ${currentShapeType === 'dogWalk' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}
                    >
                        <Circle size={16} /> Dog Walk
                    </button>
                    <button 
                        onClick={() => setShapeType('aFrame')} 
                        className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-medium transition ${currentShapeType === 'aFrame' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'}`}
                    >
                        <Circle size={16} /> A Frame
                    </button>
                </div>
            </div>

            {/*color selector*/}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Colors</label>
                <div className="flex items-center gap-3 bg-slate-700 p-2 rounded-lg border border-slate-600">
                    <input 
                        type="color" 
                        value={currentColor} 
                        onChange={(e) => setCurrentColor(e.target.value)} 
                        className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" 
                    />
                    <span className="font-mono text-sm uppercase text-slate-300">{currentColor}</span>
                </div>
            </div>

            {/*obstacle actions*/}
            {selectedId && (
                <div className="flex flex-col gap-2 mt-2 p-4 bg-slate-900/50 rounded-lg border border-red-900/30">
                    <label className="text-xs font-semibold text-red-400 uppercase tracking-wider">Selected Element</label>
                    <button 
                        onClick={() => {
                            deleteShape(selectedId);
                        }} 
                        className="flex items-center justify-center gap-2 w-full bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white p-2.5 rounded-lg border border-red-500/30 transition text-sm font-medium"
                    >
                        <Trash2 size={16} /> Delete obstacle
                    </button>
                </div>
            )}

            {/*import/export section*/}
            <div className="mt-auto flex flex-col gap-2 border-t border-slate-700 pt-6">
                <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Import/Export</label>
                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={handleExport} 
                        className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white p-2.5 rounded-lg text-sm transition"
                    >
                        <Download size={16} /> Export
                    </button>
                    <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white p-2.5 rounded-lg text-sm transition"
                    >
                        <Upload size={16} /> Import
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
                </div>
            </div>
        </div>
    )
}
