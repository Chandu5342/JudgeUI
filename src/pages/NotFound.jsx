import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
    <div className="text-center">
      <h1 className="mb-4">404</h1>
      <p className="lead text-muted mb-4">Oops! Page not found</p>
      <Link to="/" className="text-decoration-underline">Return to Home</Link>
    </div>
  </div>
);

export default NotFound;
