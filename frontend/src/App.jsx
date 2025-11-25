import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  RefreshCw, Plus, Trash2, Save, FileSpreadsheet,
  LayoutGrid, Download, Share2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import './App.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [spreadsheetId, setSpreadsheetId] = useState('15SPM1kFVP-IeKFQi3Q-N2ZnbIjiqPp_-WOngRXk-eMs');
  const [range, setRange] = useState('Sheet1!A1:E100');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);

  const fetchData = async (silent = false) => {
    if (!spreadsheetId || !range) return;
    if (!silent) setLoading(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/spreadsheet/${spreadsheetId}/data`,
        { params: { range } }
      );
      setData(response.data.values || []);
      if (!silent) toast.success('Data refreshed');
    } catch (err) {
      toast.error('Failed to fetch data');
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    if (!spreadsheetId) return;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/spreadsheet/${spreadsheetId}/metadata`
      );
      setMetadata(response.data);
    } catch (err) {
      console.error('Failed to fetch metadata:', err);
    }
  };

  const addRow = () => {
    const newRow = Array(data[0]?.length || 5).fill('');
    setData([...data, newRow]);
    toast('New row added', { icon: '➕' });
  };

  const updateCell = (rowIndex, colIndex, value) => {
    const updatedData = [...data];
    if (!updatedData[rowIndex]) updatedData[rowIndex] = [];
    updatedData[rowIndex][colIndex] = value;
    setData(updatedData);
  };

  const saveChanges = async () => {
    const toastId = toast.loading('Saving changes...');
    try {
      await axios.put(
        `${API_BASE_URL}/spreadsheet/${spreadsheetId}/update`,
        { range, values: data }
      );
      toast.success('Changes saved successfully!', { id: toastId });
      fetchData(true);
    } catch (err) {
      toast.error('Failed to save changes', { id: toastId });
    }
  };

  const deleteRow = (rowIndex) => {
    if (window.confirm('Are you sure you want to delete this row?')) {
      const updatedData = data.filter((_, index) => index !== rowIndex);
      setData(updatedData);
      toast('Row deleted', { icon: '🗑️' });
    }
  };

  useEffect(() => {
    fetchData();
    fetchMetadata();
  }, []);

  return (
    <div className="app-container">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
          borderRadius: '8px',
        }
      }} />

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">
            <LayoutGrid className="logo-icon" size={28} />
            <span>Sheets<span style={{ color: 'var(--primary)' }}>Master</span></span>
          </div>
          <div className="actions">
            <button className="btn btn-secondary" onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${spreadsheetId}`, '_blank')}>
              <Share2 size={18} /> Open in Google
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="controls-bar">
          <div className="input-wrapper">
            <label className="label">Spreadsheet ID</label>
            <input
              className="input"
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              placeholder="Enter ID..."
            />
          </div>
          <div className="input-wrapper">
            <label className="label">Range</label>
            <input
              className="input"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              placeholder="e.g. Sheet1!A1:E100"
            />
          </div>
          <div className="actions">
            <button onClick={() => fetchData()} className="btn btn-secondary" disabled={loading}>
              <RefreshCw size={18} className={loading ? 'spin' : ''} /> Refresh
            </button>
            <button onClick={addRow} className="btn btn-success">
              <Plus size={18} /> Add Row
            </button>
            <button onClick={saveChanges} className="btn btn-primary" disabled={loading}>
              <Save size={18} /> Save Changes
            </button>
          </div>
        </div>

        <div className="grid-container">
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
            </div>
          )}

          <div className="table-wrapper">
            {data.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th className="row-num">#</th>
                    {data[0]?.map((_, i) => (
                      <th key={i}>{String.fromCharCode(65 + i)}</th>
                    ))}
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, rIndex) => (
                    <tr key={rIndex}>
                      <td className="row-num">{rIndex + 1}</td>
                      {row.map((cell, cIndex) => (
                        <td key={cIndex}>
                          <input
                            className="cell-input"
                            value={cell || ''}
                            onChange={(e) => updateCell(rIndex, cIndex, e.target.value)}
                          />
                        </td>
                      ))}
                      <td>
                        <button onClick={() => deleteRow(rIndex)} className="btn-icon">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <FileSpreadsheet className="empty-icon" />
                <h3>No Data Found</h3>
                <p>Check your Spreadsheet ID and Range, then click Refresh.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
