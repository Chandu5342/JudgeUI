import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('Logged out');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="d-flex flex-column bg-light border-end" style={{ width: 250, minHeight: '100vh' }}>
      <div className="p-3 border-bottom">
        <Link to="/dashboard" className="text-decoration-none">
          <h5 className="mb-0">AI Judge</h5>
          <small className="text-muted">Legal System</small>
        </Link>
      </div>

      <div className="flex-grow-1 p-3">
        <ul className="nav nav-pills flex-column">
          <li className="nav-item mb-2">
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/cases" className={`nav-link ${isActive('/cases') ? 'active' : ''}`}>My Cases</Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/cases/browse" className={`nav-link ${isActive('/cases/browse') ? 'active' : ''}`}>Browse Cases</Link>
          </li>
          <li className="nav-item mb-2">
            <Link to="/cases/new" className={`nav-link ${isActive('/cases/new') ? 'active' : ''}`}>Create Case</Link>
          </li>
        </ul>
      </div>

      <div className="p-3 border-top">
        <div className="mb-2">
          <div className="fw-bold">{user.name}</div>
          <div className="small text-muted">{user.email}</div>
        </div>
        <button className="btn btn-outline-secondary w-100" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Sidebar;
