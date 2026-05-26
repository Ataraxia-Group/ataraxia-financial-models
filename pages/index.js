import React, { useState, useEffect } from 'react';
import ProductionInputs from '../components/ProductionInputs';

export default function App() {
  const [modelId, setModelId] = useState(null);
  const [modelName, setModelName] = useState('Test Model');
  const [activeTab, setActiveTab] = useState('production');

  useEffect(() => {
    const testModelId = 'test-model-' + Date.now();
    setModelId(testModelId);
  }, []);

  const handleSave = () => {
    console.log('Data saved from active tab');
  };

  const tabs = [
    { id: 'production', label: 'Production Inputs', icon: '📊' },
    { id: 'project', label: 'Project Inputs', icon: '📝', disabled: true },
    { id: 'capital', label: 'Capital Structure', icon: '💰', disabled: true },
    { id: 'cashflows', label: 'Cash Flows', icon: '💵', disabled: true },
    { id: 'returns', label: 'Returns', icon: '📈', disabled: true },
    { id: 'results', label: 'Results', icon: '✓', disabled: true },
    { id: 'scenarios', label: 'Scenarios', icon: '🎯', disabled: true }
  ];

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">Financial Model</h1>
          <input
            type="text"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="model-name-input"
            placeholder="Model name..."
          />
        </div>
        <div className="header-right">
          <button className="btn-outline">Export PDF</button>
          <button className="btn-primary">Save Model</button>
        </div>
      </header>

      <nav className="tab-navigation">
        <div className="tabs-container">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
              disabled={tab.disabled}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="tab-pane">
        {modelId && activeTab === 'production' && (
          <ProductionInputs modelId={modelId} onSave={handleSave} />
        )}
        
        {activeTab !== 'production' && (
          <div className="tab-content placeholder">
            <div className="placeholder-box">
              <p>Tab: {activeTab} (Coming soon)</p>
              <p style={{ marginTop: '12px', fontSize: '12px', color: '#888' }}>
                Complete Production Inputs first, then unlock this tab.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
