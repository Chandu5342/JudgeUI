import client from './client';

export async function generateVerdict(caseId, opts = {}) {
  const res = await client.post(`/judge/${caseId}/verdict`, opts);
  return res.data;
}

export async function submitArgument(caseId, text, side) {
  const body = { text };
  if (side) body.side = side;
  const res = await client.post(`/judge/${caseId}/argument`, body);
  return res.data;
}
