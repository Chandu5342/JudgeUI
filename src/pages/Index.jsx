import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Auto-redirect logged-in users to dashboard
    if (user && user.id) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="text-center text-white">
        <h1 className="mb-4 display-4">⚖️ Welcome to AI Judge</h1>
        <p className="lead mb-5">Resolve your disputes with the power of AI-driven legal analysis</p>
        
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link to="/login" className="btn btn-light btn-lg px-5">
            🔐 Login
          </Link>
          <Link to="/register" className="btn btn-outline-light btn-lg px-5">
            📝 Register
          </Link>
        </div>

        <div className="mt-5 pt-5">
          <h5 className="text-white-50">Features</h5>
          <div className="row mt-4">
            <div className="col-md-4 mb-4">
              <div className="bg-white bg-opacity-10 p-4 rounded">
                <div className="fs-3 mb-2">📋</div>
                <h6>Create Cases</h6>
                <small>Build your legal case with documents and arguments</small>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="bg-white bg-opacity-10 p-4 rounded">
                <div className="fs-3 mb-2">🤖</div>
                <h6>AI Judge</h6>
                <small>Get instant verdicts powered by AI analysis</small>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="bg-white bg-opacity-10 p-4 rounded">
                <div className="fs-3 mb-2">⚡</div>
                <h6>Fast & Transparent</h6>
                <small>Quick resolutions with transparent reasoning</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
