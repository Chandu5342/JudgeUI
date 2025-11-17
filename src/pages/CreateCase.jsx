import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { createCase } from '../api/cases';
import { useNavigate } from 'react-router-dom';

const CreateCase = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', category: '', jurisdiction: '', status: 'draft' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await createCase({ ...formData, lawyerA: user.id });
      const payload = resp.data || resp;
      const inner = payload.data || payload;
      const newCase = inner.case || inner;
      alert('Case created');
      navigate(`/cases/${newCase._id || newCase.id}`);
    } catch (err) {
      console.error(err);
      alert('Failed to create case');
    } finally { setLoading(false); }
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <div className="max-w-800 mx-auto">
          <h3>Create New Case</h3>
          <p className="text-muted">Fill in the case details to get started</p>

          <div className="card p-3">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Case Title</label>
                <input className="form-control" value={formData.title} onChange={(e)=>setFormData({...formData, title:e.target.value})} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={5} value={formData.description} onChange={(e)=>setFormData({...formData, description:e.target.value})} required />
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={formData.category} onChange={(e)=>setFormData({...formData, category:e.target.value})} required>
                    <option value="">Select category</option>
                    <option>Civil</option>
                    <option>Criminal</option>
                    <option>Commercial</option>
                    <option>Family</option>
                    <option>Property</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Jurisdiction</label>
                  <select className="form-select" value={formData.jurisdiction} onChange={(e)=>setFormData({...formData, jurisdiction:e.target.value})} required>
                    <option value="">Select jurisdiction</option>
                    <option>California</option>
                    <option>New York</option>
                    <option>Texas</option>
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Case'}</button>
                <button type="button" className="btn btn-outline-secondary" onClick={()=>navigate('/dashboard')}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCase;
