// src/Dashboard.jsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
// We will generate this file automatically in the next step!
import { previews } from './dashboard.data'; 

const Dashboard = () => {
  const [search, setSearch] = useState('');

  // Filter components based on search
  const filtered = previews.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#333' }}>MockMirror</h1>
        <p style={{ color: '#666' }}>
          Reflecting your code changes with AI-generated data.
          {previews.length} component{previews.length !== 1 ? 's' : ''} modified in this PR.

        </p>
      </header>

      {/* Creative: A Search Bar */}
      <input 
        type="text" 
        placeholder="🔍 Search components..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '15px',
          fontSize: '1rem',
          borderRadius: '8px',
          border: '1px solid #ddd',
          marginBottom: '30px'
        }}
      />

      {/* The Grid of Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {filtered.map((item) => (
          <a 
            key={item.name} 
            href={item.url} 
            target="_blank" // Open in new tab
            style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              display: 'block' 
            }}
          >
            <div style={{
              border: '1px solid #eee',
              borderRadius: '12px',
              padding: '20px',
              backgroundColor: 'white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <h2 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>{item.name}</h2>
              <span style={{ 
                backgroundColor: '#e3f2fd', 
                color: '#1976d2', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '0.8rem' 
              }}>
                View Preview &rarr;
              </span>
            </div>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: '#999' }}>No components match your search.</p>
      )}
    </div>
  );
};

// Mount the app
ReactDOM.createRoot(document.getElementById('root')).render(<Dashboard />);