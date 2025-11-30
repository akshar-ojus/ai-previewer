import React from 'react';
import { Link } from 'react-router-dom';

// This component WILL CRASH if rendered without a <BrowserRouter>
const SmartLink = ({ label, to }) => {
  return (
    <div className="nav-link">
      <p>✨ NEW: Navigate quickly to {label}</p>
      <Link to={to} style={{ color: 'blue' }}>
        Go Now &rarr;
      </Link>
    </div>
  );
};

export default SmartLink;