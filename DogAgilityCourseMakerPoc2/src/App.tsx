import React from 'react';
import { Sidebar } from './components/sidebar';
import { CanvasArea } from './components/canvasArea';
import './App.css'

const App: React.FC = () => {
  return (
    <div style={{ display: 'table', width: '100vw', height: '100vh', tableLayout: 'fixed'}}>
      <div style={{ display: 'table-cell', width: '320px', verticalAlign: 'top'}}>
        <Sidebar />
      </div>
      <div style={{ display: 'table-cell', verticalAlign: 'top' }}>
        <CanvasArea />
      </div>
    </div>
  )
}

export default App;