import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getMyCases } from '../api/cases';
import { Link } from 'react-router-dom';

const CasesList = () => {
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

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3>My Cases</h3>
            <div className="text-muted">Manage all your legal cases</div>
          </div>
          <Link to="/cases/new" className="btn btn-primary">Create New Case</Link>
        </div>

        {loading ? <div className="card p-4">Loading cases...</div> : cases.length === 0 ? (
          <div className="card p-4 text-center">No cases found. <Link to="/cases/new">Create one</Link></div>
        ) : (
          <div className="row">
            {cases.map(c => (
              <div className="col-md-6 mb-3" key={c._id || c.id}>
                <div className="card p-3">
                  <h5>{c.title}</h5>
                  <div className="text-muted mb-2">{c.description}</div>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="small text-muted">{c.category} • {c.jurisdiction} • {(c.documents || []).length} docs</div>
                    <Link to={`/cases/${c._id || c.id}`} className="btn btn-outline-primary btn-sm">View Details</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CasesList;
