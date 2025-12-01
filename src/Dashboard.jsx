import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { previews } from './dashboard.data';
import './dashboard.css'; // Import the new styles

const Dashboard = () => {
  const [search, setSearch] = useState('');
  // Select the first component by default, or null if none exist
  const [selected, setSelected] = useState(previews.length > 0 ? previews[0] : null);

  const filtered = previews.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* LEFT SIDEBAR: Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="brand">MockMirror</h1>
          <p className="subtitle">
            {previews.length} changed component{previews.length !== 1 ? 's' : ''}
          </p>
          <input 
            type="text" 
            className="search-box"
            placeholder="Search Components" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <ul className="component-list">
          {filtered.map((item) => (
            <li 
              key={item.name}
              className={`nav-item ${selected?.name === item.name ? 'active' : ''}`}
              onClick={() => setSelected(item)}
            >
              <span className="component-name">{item.name}</span>
              <span className="component-path">{item.originalPath}</span>
            </li>
          ))}
          {filtered.length === 0 && (
            <li style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              No components found
            </li>
          )}
        </ul>
      </aside>

      {/* RIGHT STAGE: Live Preview */}
      <main className="stage">
        {selected ? (
          <iframe 
            src={selected.url} 
            title={selected.name}
            className="preview-frame"
          />
        ) : (
          <div className="empty-state">
            Select a component to preview
          </div>
        )}
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<Dashboard />);