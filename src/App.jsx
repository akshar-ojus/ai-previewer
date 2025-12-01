// src/App.js
import React from 'react';
import SimpleFlow from './SimpleFlow';

export default function App() {
  console.log("App component rendered");
  return (
    // The wrapper needs a specific height for React Flow to render
    <div style={{ width: '100%', height: '100vh' }}>
      <SimpleFlow />
    </div>
  );
}