// Simulated API with dummy data - NO REAL API CALLS

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

let users = [
  { id: '1', name: 'John Advocate', email: 'john@law.com', role: 'LawyerA', phone: '+1234567890', barRegistration: 'BAR-2020-001' },
  { id: '2', name: 'Sarah Counsel', email: 'sarah@law.com', role: 'LawyerB', phone: '+1234567891', barRegistration: 'BAR-2019-045' }
];

let cases = [
  {
    id: '1',
    title: 'Smith vs. Johnson Property Dispute',
    description: 'A boundary dispute regarding property line demarcation between two adjacent properties.',
    category: 'Civil',
    jurisdiction: 'California',
    status: 'in_hearing',
    lawyerA: '1',
    lawyerB: '2',
    createdAt: '2025-01-10T10:00:00Z',
    documents: [
      { id: 'd1', name: 'Property Survey Report', type: 'evidence', uploadedBy: 'John Advocate', uploadedAt: '2025-01-10T11:00:00Z' },
      { id: 'd2', name: 'Historical Deeds', type: 'legal', uploadedBy: 'Sarah Counsel', uploadedAt: '2025-01-11T09:00:00Z' }
    ],
    sideASubmissions: [],
    sideBSubmissions: [],
    verdict: null,
    arguments: []
  },
  {
    id: '2',
    title: 'Corporate Contract Breach - Tech Solutions Inc.',
    description: 'Alleged breach of service contract terms and seeking damages.',
    category: 'Commercial',
    jurisdiction: 'New York',
    status: 'submitted',
    lawyerA: '1',
    lawyerB: null,
    createdAt: '2025-01-12T14:30:00Z',
    documents: [],
    sideASubmissions: [],
    sideBSubmissions: [],
    verdict: null,
    arguments: []
  }
];

export async function fakeLogin(email, password) {
  await delay(500);
  const user = users.find((u) => u.email === email);
  if (!user) throw new Error('Invalid credentials');
  const token = `fake-token-${user.id}-${Date.now()}`;
  return { user, token };
}

export async function fakeRegister(data) {
  await delay(800);
  const existing = users.find((u) => u.email === data.email);
  if (existing) throw new Error('Email already registered');
  const newUser = { ...data, id: String(users.length + 1) };
  users.push(newUser);
  const token = `fake-token-${newUser.id}-${Date.now()}`;
  return { user: newUser, token };
}

export async function fakeVerifyToken(token) {
  await delay(200);
  const parts = token ? token.split('-') : [];
  const userId = parts[2];
  return users.find((u) => u.id === userId) || null;
}

export async function fakeCreateCase(data) {
  await delay(600);
  const newCase = {
    ...data,
    id: String(cases.length + 1),
    createdAt: new Date().toISOString(),
    documents: [],
    lawyerB: null,
    sideASubmissions: [],
    sideBSubmissions: [],
    verdict: null,
    arguments: []
  };
  cases.push(newCase);
  return newCase;
}

export async function fakeGetMyCases(userId) {
  await delay(300);
  return cases.filter((c) => c.lawyerA === userId || c.lawyerB === userId);
}

export async function fakeGetCaseDetails(caseId) {
  await delay(300);
  const c = cases.find((x) => x.id === caseId);
  if (!c) throw new Error('Case not found');
  return c;
}

export async function fakeJoinCase(caseId, userId) {
  await delay(300);
  const c = cases.find((x) => x.id === caseId);
  if (!c) throw new Error('Case not found');
  if (c.lawyerB) throw new Error('Case already has Lawyer B');
  c.lawyerB = userId;
  return c;
}

export async function fakeAddDocument(caseId, file, type, uploadedBy) {
  await delay(400);
  const c = cases.find((x) => x.id === caseId);
  if (!c) throw new Error('Case not found');
  const newDoc = { id: `d${c.documents.length + 1}`, name: typeof file === 'string' ? 'Text Document' : file.name, type, uploadedBy, uploadedAt: new Date().toISOString(), content: typeof file === 'string' ? file : undefined };
  c.documents.push(newDoc);
  return newDoc;
}

export async function fakeUpdateCaseStatus(caseId, status) {
  await delay(200);
  const c = cases.find((x) => x.id === caseId);
  if (!c) throw new Error('Case not found');
  c.status = status;
  return c;
}

export async function fakeUploadSideA(caseId, data) {
  await delay(400);
  const c = cases.find((x) => x.id === caseId);
  if (!c) throw new Error('Case not found');
  const submission = { id: `sa${c.sideASubmissions.length + 1}`, caseText: data.caseText, documentName: data.documentName, submittedAt: new Date().toISOString(), submittedBy: data.submittedBy };
  c.sideASubmissions.push(submission);
  return submission;
}

export async function fakeUploadSideB(caseId, data) {
  await delay(400);
  const c = cases.find((x) => x.id === caseId);
  if (!c) throw new Error('Case not found');
  const submission = { id: `sb${c.sideBSubmissions.length + 1}`, caseText: data.caseText, documentName: data.documentName, submittedAt: new Date().toISOString(), submittedBy: data.submittedBy };
  c.sideBSubmissions.push(submission);
  return submission;
}

export async function fakeGetVerdict(caseId) {
  await delay(800);
  const c = cases.find((x) => x.id === caseId);
  if (!c) throw new Error('Case not found');
  const verdict = `Preliminary verdict for case ${caseId}: The court suggests mediation and split costs.`;
  c.verdict = verdict;
  return verdict;
}

export async function fakeSubmitArgument(caseId, argument, side) {
  await delay(400);
  const c = cases.find((x) => x.id === caseId);
  if (!c) throw new Error('Case not found');
  if (c.arguments.length >= 5) throw new Error('Maximum arguments reached');
  const responses = [
    'The court notes this submission but maintains the principal finding.',
    'This argument will be considered; it does not alter the core decision.',
    'After review, the court provides a clarification but keeps the verdict.',
    'The court accepts portions of the argument; limited adjustment applied.',
    'The court affirms the decision after consideration.'
  ];
  const newArg = { id: `arg${c.arguments.length + 1}`, side, content: argument, submittedAt: new Date().toISOString(), judgeResponse: responses[c.arguments.length % responses.length] };
  c.arguments.push(newArg);
  return newArg;
}

export { users, cases };
