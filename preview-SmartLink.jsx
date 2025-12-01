
      import React from 'react';
      import ReactDOM from 'react-dom/client';
      import './src/UserCard.css';
      import { BrowserRouter } from 'react-router-dom';
      import TargetComponent from './src/SmartLink.jsx';
      
      const mockProps = {"label":"Product Details","to":"/products/123"};

      ReactDOM.createRoot(document.getElementById('root')).render(
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
          <BrowserRouter>
            <TargetComponent {...mockProps} />
          </BrowserRouter>
        </div>
      );
    