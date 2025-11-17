import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getMyCases } from '../api/cases';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { loadCases(); }, []);
  const loadCases = async () => {
    try {
      const resp = await getMyCases();
      const payload = resp.data || resp;
      const inner = payload.data || payload;
      setCases(inner.cases || inner || []);
    } catch (err) {
      console.error(err);
      setCases([]);
    } finally { setLoading(false); }
  };

  const stats = { total: cases.length, inHearing: cases.filter(c=>c.status==='in_hearing').length, closed: cases.filter(c=>c.status==='closed').length, draft: cases.filter(c=>c.status==='draft').length };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <h2>Dashboard</h2>
        <p className="text-muted">Welcome back, {user.name}</p>

        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card p-3">Total Cases <div className="h2">{stats.total}</div></div>
          </div>
          <div className="col-md-3">
            <div className="card p-3">In Hearing <div className="h2 text-warning">{stats.inHearing}</div></div>
          </div>
          <div className="col-md-3">
            <div className="card p-3">Closed <div className="h2 text-success">{stats.closed}</div></div>
          </div>
          <div className="col-md-3">
            <div className="card p-3">Drafts <div className="h2">{stats.draft}</div></div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Recent Cases</h4>
          <Link to="/cases/new" className="btn btn-primary">Create New Case</Link>
        </div>

        {loading ? (
          <div className="card p-4">Loading cases...</div>
        ) : cases.length === 0 ? (
          <div className="card p-4 text-center">No cases yet. <Link to="/cases/new">Create one</Link></div>
        ) : (
          <div className="row">
            {cases.map((c, index) => (
  <div className="col-md-6 mb-3" key={c.id || c._id || index}>
    <div className="card h-100 p-3">
      <div className="d-flex justify-content-between">
        <div>
          <h5>{c.title}</h5>
          <div className="text-muted">{c.description}</div>
        </div>
        <div>
          <span className="badge bg-secondary">
            {c.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="mt-3 d-flex justify-content-between align-items-center">
        <div className="small text-muted">
          {c.category} • {c.jurisdiction}
        </div>
        <Link
          to={`/cases/${c.id || c._id}`}
          className="btn btn-outline-primary btn-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  </div>
))}

          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
