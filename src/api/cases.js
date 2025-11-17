import client from './client';

export async function createCase(data) {
  const res = await client.post('/cases', data);
  return res.data;
}

export async function getMyCases() {
  const res = await client.get('/cases');
  return res.data;
}

export async function getPublicCases() {
  const res = await client.get('/cases/public');
  return res.data;
}

export async function getCaseDetails(caseId) {
  const res = await client.get(`/cases/${caseId}`);
  return res.data;
}

export async function joinCase(caseId) {
  const res = await client.post(`/cases/${caseId}/join`);
  return res.data;
}

export async function addDocument(caseId, { file, documentName, documentUrl, documentType }) {
  // If a file object is provided, upload via form-data
  if (file instanceof File) {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('documentType', documentType || 'legal');
    const res = await client.post(`/cases/${caseId}/documents`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  }
  // Otherwise send JSON payload
  const res = await client.post(`/cases/${caseId}/documents`, { documentName, documentUrl, documentType });
  return res.data;
}

export async function updateStatus(caseId, status) {
  const res = await client.put(`/cases/${caseId}/status`, { status });
  return res.data;
}
