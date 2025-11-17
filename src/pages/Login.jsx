import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api/auth';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await login(email, password);
      const payload = resp.data || resp;
      const inner = payload.data || payload;
      const token = inner.token;
      const user = inner.user;
      if (!token) throw new Error('No token returned');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user || {}));
      alert('Login successful');
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card p-4 shadow-sm" style={{ width: 420 }}>
        <h4 className="mb-3">Sign in to AI Judge</h4>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn btn-primary w-100" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
          <div className="text-center mt-3">
            <small>Don't have an account? <Link to="/register">Register</Link></small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
