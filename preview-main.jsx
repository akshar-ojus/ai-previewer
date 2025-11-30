
    import React from 'react';
    import ReactDOM from 'react-dom/client';
    import './src/UserCard.css';
    import { BrowserRouter } from 'react-router-dom'; 
    import TargetComponent from './src/SmartLink.jsx'; 

    // We embed the mock data directly from the analysis
    const mockProps = {"label":"Home Page","to":"/home"};

    ReactDOM.createRoot(document.getElementById('root')).render(
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
        <h1>Smart Preview</h1>
        <hr />
        <br />
        {/* The wrapper strings (like <BrowserRouter>) are injected here */}
        <BrowserRouter>
          <TargetComponent {...mockProps} />
        </BrowserRouter>
      </div>
    );
  