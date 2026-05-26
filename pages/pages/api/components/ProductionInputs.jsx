import React, { useState, useEffect } from 'react';

export default function ProductionInputs({ modelId, onSave }) {
  const [unitTypes, setUnitTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!modelId) return;
    fetchUnitTypes();
  }, [modelId]);

  const fetchUnitTypes = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/production-inputs?modelId=${modelId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setUnitTypes(data || []);
    } catch (err) {
      setError(err.message);
      setUnitTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const addRow = () => {
    const newRow = {
      id: `new-${Date.now()}`,
      unitTypeName: '',
      revenuePerUnit: '',
      cogsPerUnit: '',
      cogsCoaId: '',
      isNew: true
    };
    setUnitTypes([...unitTypes, newRow]);
  };

  const updateRow = (id, field, value) => {
    setUnitTypes(
      unitTypes.map(row =>
        row.id === id ? { ...row, [field]: value, isDirty: true } : row
      )
    );
  };

  const deleteRow = async (id) => {
    if (id.toString().startsWith('new-')) {
      setUnitTypes(unitTypes.filter(row => row.id !== id));
    } else {
      try {
        await fetch(`/api/production-inputs/${id}`, { method: 'DELETE' });
        setUnitTypes(unitTypes.filter(row => row.id !== id));
      } catch (err) {
        setError('Failed to delete row');
      }
    }
  };

  const saveAll = async () => {
    try {
      setSaving(true);
      setError(null);

      const payload = {
        modelId,
        unitTypes: unitTypes.map(row => ({
          id: row.id.toString().startsWith('new-') ? null : row.id,
          unitTypeName: row.unitTypeName,
          revenuePerUnit: parseFloat(row.revenuePerUnit) || 0,
          cogsPerUnit: parseFloat(row.cogsPerUnit) || 0,
          cogsCoaId: row.cogsCoaId || null
        }))
      };

      const res = await fetch('/api/production-inputs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Save failed');
      
      const saved = await res.json();
      setUnitTypes(saved);
      onSave?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="tab-content"><p>Loading...</p></div>;

  return (
    <div className="tab-content production-inputs">
      <div className="tab-header">
        <h2>Production Inputs</h2>
        <p className="tab-description">Define unit types, revenue per unit, and cost of goods sold. These feed into the financial model.</p>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="table-wrapper">
        <table className="input-table">
          <thead>
            <tr>
              <th>Unit Type Name</th>
              <th>Revenue / Unit</th>
              <th>COGS / Unit</th>
              <th>COGS Account</th>
              <th width="60"></th>
            </tr>
          </thead>
          <tbody>
            {unitTypes.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="5">No unit types added. Click "Add Unit Type" to begin.</td>
              </tr>
            ) : (
              unitTypes.map(row => (
                <tr key={row.id} className={row.isDirty ? 'dirty' : ''}>
                  <td>
                    <input
                      type="text"
                      placeholder="e.g., Aircraft Hour, Beverage Transaction"
                      value={row.unitTypeName}
                      onChange={(e) => updateRow(row.id, 'unitTypeName', e.target.value)}
                      className="input-sm"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      value={row.revenuePerUnit}
                      onChange={(e) => updateRow(row.id, 'revenuePerUnit', e.target.value)}
                      className="input-sm numeric"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      value={row.cogsPerUnit}
                      onChange={(e) => updateRow(row.id, 'cogsPerUnit', e.target.value)}
                      className="input-sm numeric"
                    />
                  </td>
                  <td>
                    <select
                      value={row.cogsCoaId || ''}
                      onChange={(e) => updateRow(row.id, 'cogsCoaId', e.target.value)}
                      className="input-sm"
                    >
                      <option value="">← COA Placeholder</option>
                      <option disabled>Coming soon: Chart of Accounts</option>
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => deleteRow(row.id)}
                      className="btn-delete"
                      title="Delete row"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="actions">
        <button onClick={addRow} className="btn-secondary">
          + Add Unit Type
        </button>
        <button
          onClick={saveAll}
          disabled={saving || unitTypes.length === 0}
          className="btn-primary"
        >
          {saving ? 'Saving...' : 'Save Production Inputs'}
        </button>
      </div>
    </div>
  );
}
