
      import React from 'react';
      import ReactDOM from 'react-dom/client';
      import './src/UserCard.css';
      
      import TargetComponent from './src/UserCard.jsx';
      
      const mockProps = {"username":"Alice Wonderland","email":"alice.wonderland@example.com","isOnline":true,"badges":["Admin","Premium Member","Verified"]};

      ReactDOM.createRoot(document.getElementById('root')).render(
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
          
            <TargetComponent {...mockProps} />
          
        </div>
      );
    