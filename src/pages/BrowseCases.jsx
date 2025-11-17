import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getPublicCases, joinCase } from '../api/cases';
import { Link } from 'react-router-dom';

const BrowseCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningCaseId, setJoiningCaseId] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { loadCases(); }, []);
  
  const loadCases = async () => {
    try {
      const resp = await getPublicCases();
      const payload = resp.data || resp;
      const inner = payload.data || payload;
      setCases(inner.cases || inner || []);
    } catch (err) {
      console.error(err);
      setCases([]);
    } finally { setLoading(false); }
  };

  const handleJoinCase = async (caseId) => {
    setJoiningCaseId(caseId);
    try {
      await joinCase(caseId);
      alert('Successfully joined case as Lawyer B');
      loadCases();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to join case');
    } finally {
      setJoiningCaseId(null);
    }
  };

  const getCaseStatus = (c) => {
    if (c.lawyerB) return 'Assigned';
    return 'Awaiting Lawyer B';
  };

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3>Browse Cases to Join</h3>
            <div className="text-muted">Find cases that need your expertise</div>
          </div>
          <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
        </div>

        {loading ? (
          <div className="card p-4">Loading cases...</div>
        ) : cases.length === 0 ? (
          <div className="card p-4 text-center">No cases available to join.</div>
        ) : (
          <div className="row">
            {cases.map((c) => {
              const isAssigned = !!c.lawyerB;
              const isMyCase = c.lawyerA?._id === user.id || c.lawyerA === user.id;
              const canJoin = !isAssigned && !isMyCase;
              
              return (
                <div className="col-md-6 mb-3" key={c._id || c.id}>
                  <div className={`card h-100 p-3 ${isAssigned ? 'bg-light' : ''}`}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h5>{c.title}</h5>
                        <div className="text-muted small">{c.description}</div>
                      </div>
                      <div>
                        <span className={`badge ${isAssigned ? 'bg-success' : 'bg-warning'}`}>
                          {getCaseStatus(c)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="small text-muted">
                        <div><strong>Category:</strong> {c.category}</div>
                        <div><strong>Jurisdiction:</strong> {c.jurisdiction}</div>
                        <div><strong>Status:</strong> {c.status?.replace('_', ' ').toUpperCase()}</div>
                        <div><strong>Lawyer A:</strong> {c.lawyerA?.name || 'Unknown'}</div>
                        {isAssigned && <div><strong>Lawyer B:</strong> {c.lawyerB?.name || 'Unknown'}</div>}
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <Link
                        to={`/cases/${c._id || c.id}`}
                        className="btn btn-outline-primary btn-sm flex-grow-1"
                      >
                        View Details
                      </Link>
                      {canJoin && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleJoinCase(c._id || c.id)}
                          disabled={joiningCaseId === (c._id || c.id)}
                        >
                          {joiningCaseId === (c._id || c.id) ? 'Joining...' : 'Join as Lawyer B'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseCases;
