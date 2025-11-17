import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { getCaseDetails, addDocument } from '../api/cases';
import { generateVerdict, submitArgument } from '../api/judge';

const Hearing = () => {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [sideAText, setSideAText] = useState('');
  const [sideADoc, setSideADoc] = useState('');
  const [sideBText, setSideBText] = useState('');
  const [sideBDoc, setSideBDoc] = useState('');
  const [verdict, setVerdict] = useState('');
  const [newArgument, setNewArgument] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGeneratingVerdict, setIsGeneratingVerdict] = useState(false);
  const [winner, setWinner] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => { loadCase();  }, [caseId]);
  const getFavoredSide = (v) => {
    if (!v) return null;
    // v can be string or object
    const text = typeof v === 'string' ? v : (v.verdict || v.reasoning || JSON.stringify(v));
    if (!text) return null;
    const t = text.toLowerCase();
    if (t.includes('side a') || t.includes('student a') || t.includes('a wins') || t.includes('side a wins')) return 'A';
    if (t.includes('side b') || t.includes('student b') || t.includes('b wins') || t.includes('side b wins')) return 'B';
    return null;
  };

  const loadCase = async () => {
    try {
      const resp = await getCaseDetails(caseId);

      const payload = resp.data || resp;
      const inner = payload.data || payload;
      const caseObj = inner.case || inner;

      // Normalize arguments into a single array so UI can rely on caseData.arguments
      const normalizedArgs = [];
      const normalizeItem = (item, side) => {
        if (!item) return null;
        const content = item.content || item.text || item.argument || item.body || (typeof item === 'string' ? item : null);
        const id = item._id || item.id || undefined;
        const judgeResponse = item.judgeResponse || item.response || item.aiResponse || undefined;
        return { id, side, content, judgeResponse, raw: item };
      };

      if (Array.isArray(caseObj.arguments) && caseObj.arguments.length > 0) {
        caseObj.arguments.forEach(it => {
          const side = it.side || undefined;
          const normalized = normalizeItem(it, side);
          if (normalized) normalizedArgs.push(normalized);
        });
      } else {
        if (Array.isArray(caseObj.argumentsA)) {
          caseObj.argumentsA.forEach(it => {
            const normalized = normalizeItem(it, 'A');
            if (normalized) normalizedArgs.push(normalized);
          });
        }
        if (Array.isArray(caseObj.argumentsB)) {
          caseObj.argumentsB.forEach(it => {
            const normalized = normalizeItem(it, 'B');
            if (normalized) normalizedArgs.push(normalized);
          });
        }
      }

      setCaseData({ ...caseObj, arguments: normalizedArgs });

      const localVerdict = caseObj.verdict || caseObj.aiVerdict || null;
      if (localVerdict) setVerdict(localVerdict);

      // Evaluate winner conditions: if one side reached 0 remaining and AI favors the other side, close and set winner
      const countA = normalizedArgs.filter(a => a.side === 'A').length;
      const countB = normalizedArgs.filter(a => a.side === 'B').length;
      const remainingA = 5 - countA;
      const remainingB = 5 - countB;
      const favored = getFavoredSide(localVerdict);
      if ((remainingA === 0 || remainingB === 0) && favored) {
        setWinner(favored);
      } else if (remainingA === 0 && remainingB === 0) {
        setWinner('TIE');
      } else {
        setWinner(null);
      }
    } catch (err) { console.error(err); alert('Failed to load case'); }
  };

  const handleSideASubmit = async () => {
    const countA = (caseData?.arguments || []).filter(a => a.side === 'A').length;
    const remainingA = 5 - countA;
    if (remainingA <= 0) { alert('Side A has reached the maximum 5 arguments'); return; }
    if (!sideAText) { alert('Please enter argument'); return; }
    setLoading(true);
    try {
      const resp = await submitArgument(caseId, sideAText, 'A');
      console.log('Side A Submit response:', resp);
      setSideAText('');
      await new Promise(r => setTimeout(r, 400));
      await loadCase();
      alert('Argument submitted');
    } catch (err) { console.error('Submit error:', err); alert(err.message || 'Failed to submit'); } finally { setLoading(false); }
  };

  const handleSideBSubmit = async () => {
    const countB = (caseData?.arguments || []).filter(a => a.side === 'B').length;
    const remainingB = 5 - countB;
    if (remainingB <= 0) { alert('Side B has reached the maximum 5 arguments'); return; }
    if (!sideBText) { alert('Please enter argument'); return; }
    setLoading(true);
    try {
      const resp = await submitArgument(caseId, sideBText, 'B');
      console.log('Side B Submit response:', resp);
      setSideBText('');
      await new Promise(r => setTimeout(r, 400));
      await loadCase();
      alert('Argument submitted');
    } catch (err) { console.error('Submit error:', err); alert(err.message || 'Failed to submit'); } finally { setLoading(false); }
  };

  const handleGenerateVerdict = async () => {
    setIsGeneratingVerdict(true);
    try {
      const resp = await generateVerdict(caseId);
      const payload = resp.data || resp;
      const inner = payload.data || payload;
      const v = inner.aiVerdict || inner.verdict || inner;
      if (typeof v === 'string') { setVerdict(v); } else if (typeof v === 'object' && v !== null) { setVerdict(v); } else { setVerdict(JSON.stringify(v)); }
      alert('Verdict generated');
      await loadCase();
    } catch (err) { console.error(err); alert('Failed to generate verdict'); } finally { setIsGeneratingVerdict(false); }
  };

  const handleSubmitArgument = async (side) => { if (!newArgument) { alert('Please enter an argument'); return; } const args = caseData?.arguments || []; if (args.length >= 5) { alert('Maximum 5 arguments reached'); return; } setLoading(true); try { await submitArgument(caseId, newArgument, side); alert('Argument submitted'); setNewArgument(''); loadCase(); } catch (err) { console.error(err); alert(err.message || 'Failed'); } finally { setLoading(false); } };

  if (!caseData) return (<div className="d-flex"><Sidebar /><div className="flex-grow-1 d-flex align-items-center justify-content-center"><div>Loading hearing...</div></div></div>);

  const isLawyerA = caseData.lawyerA._id === user.id;
  const isLawyerB = caseData.lawyerB._id === user.id;
  const countA = (caseData.arguments || []).filter(a => a.side === 'A').length;
  const countB = (caseData.arguments || []).filter(a => a.side === 'B').length;
  const remainingA = 5 - countA;
  const remainingB = 5 - countB;

  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-4">
        {isGeneratingVerdict && (
          <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(255,255,255,0.75)', zIndex: 2000 }}>
            <div className="text-center">
              <div className="spinner-border" role="status" style={{ width: '3rem', height: '3rem' }}></div>
              <div className="mt-2">Waiting for AI response...</div>
            </div>
          </div>
        )}
        <div className="mb-3">
          <Link to={`/cases/${caseId}`} className="small text-muted">← Back to Case</Link>
          <h3 className="text-center">AI Judge and its verdict</h3>
        </div>
    <button onClick={()=>{console.log(caseData,"hello")}}>clkkk</button>
        <div className="card p-3 mb-3">
          {!verdict ? (
            <div className="text-center">
              <p className="text-muted">Click "Generate Verdict" below after both sides submit</p>
              <button className="btn btn-primary" onClick={handleGenerateVerdict} disabled={loading}>{loading ? 'Generating Verdict...' : 'Generate AI Verdict'}</button>
            </div>
          ) : (
            <div>
              <h5 className="text-center">🏛️ AI Judge Verdict</h5>
              {typeof verdict === 'string' ? (
                <div className="border p-3 rounded bg-light" style={{ whiteSpace: 'pre-wrap' }}>{verdict}</div>
              ) : (
                <div className="border p-3 rounded bg-light">
                  {verdict.verdict && <div className="mb-2"><strong>Verdict:</strong> {verdict.verdict}</div>}
                  {verdict.reasoning && <div className="mb-2"><strong>Reasoning:</strong> {verdict.reasoning}</div>}
                  {verdict.confidence && <div className="mb-2"><strong>Confidence:</strong> {verdict.confidence}%</div>}
                  {verdict.decidedAt && <div className="text-muted small">Decided at: {new Date(verdict.decidedAt).toLocaleString()}</div>}
                </div>
              )}
            </div>
          )}
        </div>
  <button onClick={()=>{console.log(caseData)}}>fddfd</button>
        {winner && (
          <div className={`alert ${winner === 'TIE' ? 'alert-secondary' : 'alert-success'} text-center`}>Case closed — {winner === 'TIE' ? 'No clear winner (tie)' : `Winner: Side ${winner}`}</div>
        )}
        {(!isLawyerA && !isLawyerB) ? (
          <div className="alert alert-warning text-center my-4">
            You are not a participant in this case. Only assigned lawyers can submit arguments.
          </div>
        ) : (
          <div className="row">
            <div className="col-md-6">
              <div className={`card p-3 mb-3 ${isLawyerA ? 'border-success border-3' : 'bg-light opacity-50'}`}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5>📝 Side A Submission</h5>
                  <div className="d-flex gap-2">
                    {isLawyerA && <div className="small badge bg-success">YOUR SIDE</div>}
                    <div className="small badge bg-info">{remainingA}/5 remaining</div>
                  </div>
                </div>

                {isLawyerA ? (
                  <div>
                    <p className="text-muted small mb-2">Upload Document</p>
                    <input 
                      type="file" 
                      className="form-control mb-2" 
                      onChange={(e) => setSideADoc(e.target.files?.[0] || '')}
                      disabled={!isLawyerA || !!winner}
                    />

                    <p className="text-muted small mb-2">Or Paste Text</p>
                    <textarea 
                      className="form-control mb-2" 
                      rows={6} 
                      value={sideAText} 
                      onChange={(e) => setSideAText(e.target.value)} 
                      placeholder="Enter your argument here..."
                      disabled={!!winner}
                    />
                    <button className="btn btn-primary w-100" onClick={handleSideASubmit} disabled={loading || !!winner || remainingA <= 0}>
                      {loading ? (
                        <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Submitting...</span>
                      ) : 'Submit Argument'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-muted small">Side A only</p>
                    <textarea 
                      className="form-control mb-2" 
                      rows={6} 
                      disabled
                      placeholder="This panel is for Side A only"
                    />
                    <button className="btn btn-secondary w-100" disabled>Not Your Side</button>
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className={`card p-3 mb-3 ${isLawyerB ? 'border-danger border-3' : 'bg-light opacity-50'}`}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5>📝 Side B Submission</h5>
                  <div className="d-flex gap-2">
                    {isLawyerB && <div className="small badge bg-danger">YOUR SIDE</div>}
                    <div className="small badge bg-info">{remainingB}/5 remaining</div>
                  </div>
                </div>

                {isLawyerB ? (
                  <div>
                    <p className="text-muted small mb-2">Upload Document</p>
                    <input 
                      type="file" 
                      className="form-control mb-2" 
                      onChange={(e) => setSideBDoc(e.target.files?.[0] || '')}
                      disabled={!isLawyerB || !!winner}
                    />

                    <p className="text-muted small mb-2">Or Paste Text</p>
                    <textarea 
                      className="form-control mb-2" 
                      rows={6} 
                      value={sideBText} 
                      onChange={(e) => setSideBText(e.target.value)} 
                      placeholder="Enter your argument here..."
                      disabled={!!winner}
                    />
                    <button className="btn btn-primary w-100" onClick={handleSideBSubmit} disabled={loading || !!winner || remainingB <= 0}>
                      {loading ? (
                        <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Submitting...</span>
                      ) : 'Submit Argument'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-muted small">Side B only</p>
                    <textarea 
                      className="form-control mb-2" 
                      rows={6} 
                      disabled
                      placeholder="This panel is for Side B only"
                    />
                    <button className="btn btn-secondary w-100" disabled>Not Your Side</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {verdict && (
          <div className="card p-3 mt-4">
            <h5 className="mb-3">📋 All Arguments (Visible to Both Sides)</h5>
            
            {(caseData.arguments || []).length > 0 ? (
              <div className="border-top pt-3">
                {caseData.arguments.map((arg, idx) => (
                  <div key={arg.id || arg._id || idx} className="mb-3 p-3 border rounded">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span className={`badge ${arg.side === 'A' ? 'bg-primary' : 'bg-danger'} me-2`}>
                          Side {arg.side}
                        </span>
                        <small className="text-muted">Round {idx + 1}</small>
                      </div>
                    </div>
                    <div className="mb-2">
                      <strong>💬 Argument:</strong>
                      <div className="mt-1 p-2 bg-white border rounded">{arg.content || arg.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted text-center py-4">
                No arguments submitted yet. Both sides can submit arguments in their panels above.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Hearing;
