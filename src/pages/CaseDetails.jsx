import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getCaseDetails, joinCase, addDocument, updateStatus } from '../api/cases';

const CaseDetails = () => {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documentText, setDocumentText] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentFile, setDocumentFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [uploadMode, setUploadMode] = useState('text'); // 'text', 'file', or 'url'
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { loadCase(); }, [caseId]);
  const loadCase = async () => {
    try {
      const resp = await getCaseDetails(caseId);
      const payload = resp.data || resp;
      const inner = payload.data || payload;
      const caseObj = inner.case || inner;
      setCaseData({ documents: [], ...caseObj });
    } catch (err) {
      console.error(err);
      setCaseData(null);
    } finally { setLoading(false); }
  };

  const handleJoinCase = async () => {
    try { await joinCase(caseId); alert('Joined case'); loadCase(); } catch (err) { alert(err.message || 'Failed to join case'); }
  };

  const handleUploadDocument = async () => {
    if (!documentType) { alert('Please select document type'); return; }
    
    if (uploadMode === 'text' && !documentText) { alert('Please paste or enter document text'); return; }
    if (uploadMode === 'file' && !documentFile) { alert('Please select a file'); return; }
    if (uploadMode === 'url' && !documentUrl) { alert('Please paste document URL'); return; }
    
    setUploadingDoc(true);
    try {
      if (uploadMode === 'file') {
        await addDocument(caseId, { file: documentFile, documentType });
      } else if (uploadMode === 'url') {
        await addDocument(caseId, { documentName: documentUrl, documentUrl, documentType });
      } else {
        const blob = new Blob([documentText], { type: 'text/plain' });
        const file = new File([blob], `${documentType}_${Date.now()}.txt`, { type: 'text/plain' });
        await addDocument(caseId, { file, documentType });
      }
      alert('Document uploaded');
      setDocumentText(''); setDocumentUrl(''); setDocumentFile(null); setDocumentType('');
      loadCase();
    } catch (err) { console.error(err); alert('Upload failed'); } finally { setUploadingDoc(false); }
  };

  const handleStatusChange = async (status) => { try { await updateStatus(caseId, status); alert('Status updated'); loadCase(); } catch (err) { console.error(err); alert('Update failed'); } };

  const getLawyerName = (val) => { if (!val) return 'Not assigned'; if (typeof val === 'string') return val; if (val && val.name) return val.name; return 'Unknown'; };

  if (loading) return (<div className="d-flex"><Sidebar /><div className="flex-grow-1 d-flex align-items-center justify-content-center"><div>Loading case details...</div></div></div>);
  if (!caseData) return (<div className="d-flex"><Sidebar /><div className="flex-grow-1 d-flex align-items-center justify-content-center"><div>Case not found</div></div></div>);

  const isLawyerA = caseData.lawyerA?._id === user.id || caseData.lawyerA === user.id;
  const bothLawyersAssigned = !!(caseData.lawyerA && caseData.lawyerB);

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h3>{caseData.title}</h3>
            <p className="text-muted">{caseData.description}</p>
            <div className="mb-2">
              <span className="badge bg-secondary me-2">{caseData.category}</span>
              <span className="badge bg-secondary">{caseData.jurisdiction}</span>
            </div>
          </div>
          <div>
            <span className={`badge ${caseData.status === 'in_hearing' ? 'bg-warning' : caseData.status === 'closed' ? 'bg-success' : 'bg-secondary'}`}>{caseData.status.replace('_',' ').toUpperCase()}</span>
            {bothLawyersAssigned && caseData.status === 'in_hearing' && <Link to={`/cases/${caseId}/hearing`} className="btn btn-primary btn-sm ms-3">🚀 Enter Hearing</Link>}
            {bothLawyersAssigned && caseData.status !== 'in_hearing' && <div className="alert alert-info small mt-2 mb-0">Both lawyers assigned. <strong>Lawyer A:</strong> Change status to "In Hearing" to start.</div>}
            {!bothLawyersAssigned && <div className="alert alert-warning small mt-2 mb-0">⏳ Waiting for {!caseData.lawyerA ? 'Lawyer A' : 'Lawyer B'} to join...</div>}
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card p-3 mb-3">
              <h5>Case Parties</h5>
              <div className="mt-2">
                <p className="text-muted">Lawyer A</p>
                <div className="fw-bold">{getLawyerName(caseData.lawyerA)}</div>
              </div>
              <div className="mt-2">
                <p className="text-muted">Lawyer B</p>
                <div className="fw-bold">{getLawyerName(caseData.lawyerB)}</div>
                {!caseData.lawyerB && user.role === 'LawyerB' && <button className="btn btn-sm btn-outline-primary mt-2" onClick={handleJoinCase}>Join as Lawyer B</button>}
              </div>
            </div>

            {isLawyerA && (
              <div className="card p-3 mb-3">
                <h5>Case Status Management</h5>
                <p className="text-muted">Only Lawyer A can update case status</p>
                <div className="d-flex gap-2">
                  <select className="form-select" value={caseData.status} onChange={(e) => handleStatusChange(e.target.value)}>
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="in_hearing">In Hearing</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="col-md-6">
            <div className="card p-3 mb-3">
              <h5>Documents ({(caseData.documents || []).length})</h5>
              {(!caseData.documents || caseData.documents.length === 0) ? (<div className="text-muted">No documents uploaded yet</div>) : (
                <div className="mt-2">
                  {caseData.documents.map((doc) => (
                    <div className="border rounded p-2 mb-2 d-flex justify-content-between" key={doc.id || doc._id}>
                      <div>
                        <div className="fw-bold">{doc.name || doc.documentName}</div>
                        <div className="small text-muted">Type: {doc.type || doc.documentType} • Uploaded by: {doc.uploadedBy || 'Unknown'}</div>
                      </div>
                      <div className="small text-muted">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-3">
              <h5>Upload Document</h5>
              <div className="mb-3">
                <label className="form-label">Document Type</label>
                <select className="form-select" value={documentType} onChange={(e) => setDocumentType(e.target.value)}>
                  <option value="">Select type</option>
                  <option value="evidence">Evidence</option>
                  <option value="legal">Legal Document</option>
                  <option value="witness">Witness Statement</option>
                  <option value="expert">Expert Opinion</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Upload Method</label>
                <div className="btn-group w-100" role="group">
                  <input type="radio" className="btn-check" name="uploadMode" id="modeText" value="text" checked={uploadMode === 'text'} onChange={(e) => setUploadMode(e.target.value)} />
                  <label className="btn btn-outline-primary" htmlFor="modeText">Paste Text</label>
                  <input type="radio" className="btn-check" name="uploadMode" id="modeFile" value="file" checked={uploadMode === 'file'} onChange={(e) => setUploadMode(e.target.value)} />
                  <label className="btn btn-outline-primary" htmlFor="modeFile">Upload File</label>
                  <input type="radio" className="btn-check" name="uploadMode" id="modeUrl" value="url" checked={uploadMode === 'url'} onChange={(e) => setUploadMode(e.target.value)} />
                  <label className="btn btn-outline-primary" htmlFor="modeUrl">Paste URL</label>
                </div>
              </div>

              {uploadMode === 'text' && (
                <div className="mb-3">
                  <label className="form-label">Document Content</label>
                  <textarea className="form-control" rows={4} placeholder="Paste or type your document content here..." value={documentText} onChange={(e) => setDocumentText(e.target.value)} />
                </div>
              )}

              {uploadMode === 'file' && (
                <div className="mb-3">
                  <label className="form-label">Select File</label>
                  <input type="file" className="form-control" onChange={(e) => setDocumentFile(e.target.files?.[0] || null)} accept=".pdf,.doc,.docx,.txt,.jpg,.png" />
                  <small className="text-muted">Supported: PDF, DOC, DOCX, TXT, JPG, PNG</small>
                </div>
              )}

              {uploadMode === 'url' && (
                <div className="mb-3">
                  <label className="form-label">Document URL</label>
                  <input type="url" className="form-control" placeholder="https://example.com/document.pdf" value={documentUrl} onChange={(e) => setDocumentUrl(e.target.value)} />
                  <small className="text-muted">Paste the full URL to the document (PDF, DOC, etc.)</small>
                </div>
              )}

              <button className="btn btn-primary w-100" onClick={handleUploadDocument} disabled={uploadingDoc}>
                {uploadingDoc ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
