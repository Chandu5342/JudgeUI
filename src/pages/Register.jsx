import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'LawyerA', phone: '', barRegistration: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await register(formData);
      const payload = resp.data || resp;
      const inner = payload.data || payload;
      const token = inner.token;
      const user = inner.user;
      if (!token) throw new Error('Registration failed');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user || {}));
      alert('Registration successful');
      navigate('/dashboard');
    } catch (err) {
      alert(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="card p-4 shadow-sm" style={{ width: 520 }}>
        <h4 className="mb-3">Create Account</h4>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Full Name</label>
              <input className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Role</label>
              <select className="form-select" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <option value="LawyerA">Lawyer A (Petitioner)</option>
                <option value="LawyerB">Lawyer B (Respondent)</option>
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Phone</label>
              <input type="tel" className="form-control" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Bar Registration</label>
              <input className="form-control" value={formData.barRegistration} onChange={(e) => setFormData({ ...formData, barRegistration: e.target.value })} />
            </div>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Register'}</button>
          <div className="mt-3 small">Already have an account? <Link to="/login">Sign in</Link></div>
        </form>
      </div>
    </div>
  );
};

export default Register;
