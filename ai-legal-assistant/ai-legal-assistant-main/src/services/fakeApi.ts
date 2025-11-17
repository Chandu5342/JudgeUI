// Simulated API with dummy data - NO REAL API CALLS

interface User {
  id: string;
  name: string;
  email: string;
  role: 'LawyerA' | 'LawyerB';
  phone: string;
  barRegistration: string;
}

interface Case {
  id: string;
  title: string;
  description: string;
  category: string;
  jurisdiction: string;
  status: 'draft' | 'submitted' | 'in_hearing' | 'closed';
  lawyerA: string;
  lawyerB: string | null;
  createdAt: string;
  documents: Document[];
  sideASubmissions: Submission[];
  sideBSubmissions: Submission[];
  verdict: string | null;
  arguments: Argument[];
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  content?: string;
}

interface Submission {
  id: string;
  caseText: string;
  documentName: string;
  submittedAt: string;
  submittedBy: string;
}

interface Argument {
  id: string;
  side: 'A' | 'B';
  content: string;
  submittedAt: string;
  judgeResponse: string;
}

// In-memory storage
let users: User[] = [
  {
    id: '1',
    name: 'John Advocate',
    email: 'john@law.com',
    role: 'LawyerA',
    phone: '+1234567890',
    barRegistration: 'BAR-2020-001'
  },
  {
    id: '2',
    name: 'Sarah Counsel',
    email: 'sarah@law.com',
    role: 'LawyerB',
    phone: '+1234567891',
    barRegistration: 'BAR-2019-045'
  }
];

let cases: Case[] = [
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
      {
        id: 'd1',
        name: 'Property Survey Report',
        type: 'evidence',
        uploadedBy: 'John Advocate',
        uploadedAt: '2025-01-10T11:00:00Z'
      },
      {
        id: 'd2',
        name: 'Historical Deeds',
        type: 'legal',
        uploadedBy: 'Sarah Counsel',
        uploadedAt: '2025-01-11T09:00:00Z'
      }
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

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const fakeLogin = async (email: string, password: string) => {
  await delay(800);
  
  const user = users.find(u => u.email === email);
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  const token = `fake-token-${user.id}-${Date.now()}`;
  return { user, token };
};

export const fakeRegister = async (data: Omit<User, 'id'>) => {
  await delay(1000);
  
  const existing = users.find(u => u.email === data.email);
  if (existing) {
    throw new Error('Email already registered');
  }
  
  const newUser: User = {
    ...data,
    id: String(users.length + 1)
  };
  
  users.push(newUser);
  const token = `fake-token-${newUser.id}-${Date.now()}`;
  return { user: newUser, token };
};

export const fakeVerifyToken = async (token: string) => {
  await delay(300);
  const userId = token.split('-')[2];
  const user = users.find(u => u.id === userId);
  return user || null;
};

export const fakeCreateCase = async (data: Omit<Case, 'id' | 'createdAt' | 'documents' | 'lawyerB' | 'sideASubmissions' | 'sideBSubmissions' | 'verdict' | 'arguments'>) => {
  await delay(1000);
  
  const newCase: Case = {
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
};

export const fakeGetMyCases = async (userId: string) => {
  await delay(600);
  return cases.filter(c => c.lawyerA === userId || c.lawyerB === userId);
};

export const fakeGetCaseDetails = async (caseId: string) => {
  await delay(500);
  const caseData = cases.find(c => c.id === caseId);
  if (!caseData) throw new Error('Case not found');
  return caseData;
};

export const fakeJoinCase = async (caseId: string, userId: string) => {
  await delay(700);
  const caseData = cases.find(c => c.id === caseId);
  if (!caseData) throw new Error('Case not found');
  if (caseData.lawyerB) throw new Error('Case already has Lawyer B');
  
  caseData.lawyerB = userId;
  return caseData;
};

export const fakeAddDocument = async (caseId: string, file: File | string, type: string, uploadedBy: string) => {
  await delay(1200);
  const caseData = cases.find(c => c.id === caseId);
  if (!caseData) throw new Error('Case not found');
  
  const newDoc: Document = {
    id: `d${caseData.documents.length + 1}`,
    name: typeof file === 'string' ? 'Text Document' : file.name,
    type,
    uploadedBy,
    uploadedAt: new Date().toISOString(),
    content: typeof file === 'string' ? file : undefined
  };
  
  caseData.documents.push(newDoc);
  return newDoc;
};

export const fakeUpdateCaseStatus = async (caseId: string, status: Case['status']) => {
  await delay(500);
  const caseData = cases.find(c => c.id === caseId);
  if (!caseData) throw new Error('Case not found');
  
  caseData.status = status;
  return caseData;
};

export const fakeUploadSideA = async (caseId: string, data: { caseText: string; documentName: string; submittedBy: string }) => {
  await delay(1000);
  const caseData = cases.find(c => c.id === caseId);
  if (!caseData) throw new Error('Case not found');
  
  const submission: Submission = {
    id: `sa${caseData.sideASubmissions.length + 1}`,
    caseText: data.caseText,
    documentName: data.documentName,
    submittedAt: new Date().toISOString(),
    submittedBy: data.submittedBy
  };
  
  caseData.sideASubmissions.push(submission);
  return submission;
};

export const fakeUploadSideB = async (caseId: string, data: { caseText: string; documentName: string; submittedBy: string }) => {
  await delay(1000);
  const caseData = cases.find(c => c.id === caseId);
  if (!caseData) throw new Error('Case not found');
  
  const submission: Submission = {
    id: `sb${caseData.sideBSubmissions.length + 1}`,
    caseText: data.caseText,
    documentName: data.documentName,
    submittedAt: new Date().toISOString(),
    submittedBy: data.submittedBy
  };
  
  caseData.sideBSubmissions.push(submission);
  return submission;
};

export const fakeGetVerdict = async (caseId: string) => {
  await delay(2000);
  const caseData = cases.find(c => c.id === caseId);
  if (!caseData) throw new Error('Case not found');
  
  const verdict = `
**COURT ORDER AND VERDICT**

Case ID: ${caseId}
Case Title: ${caseData.title}

After careful consideration of all submissions, evidence, and arguments presented by both counsels, this Court makes the following determination:

**FINDINGS:**
1. The court has reviewed the documentary evidence and witness testimonies submitted by both parties.
2. Side A has presented compelling arguments regarding the property boundary markers and historical land surveys.
3. Side B has raised valid concerns about the interpretation of the original deeds and subsequent property transfers.

**LEGAL ANALYSIS:**
Based on the applicable civil procedure laws and property rights statutes, the court finds that:
- The preponderance of evidence supports a balanced interpretation of the disputed facts.
- Both parties have demonstrated good faith efforts in presenting their cases.
- The legal precedents cited are relevant and have been duly considered.

**VERDICT:**
The court hereby orders a settlement favoring a compromise solution. Both parties are directed to:
1. Engage in mediation within 30 days
2. Consider the court's recommended boundary adjustment
3. Share surveying costs equally

**REASONING:**
This decision is based on principles of equity, the weight of evidence, and the interests of justice. The court encourages both parties to reach an amicable resolution.

*This is a preliminary decision. Arguments may be submitted for reconsideration (maximum 5 rounds).*

Dated: ${new Date().toLocaleDateString()}
AI Judge System v1.0
  `.trim();
  
  caseData.verdict = verdict;
  return verdict;
};

export const fakeSubmitArgument = async (caseId: string, argument: string, side: 'A' | 'B') => {
  await delay(1500);
  const caseData = cases.find(c => c.id === caseId);
  if (!caseData) throw new Error('Case not found');
  if (caseData.arguments.length >= 5) throw new Error('Maximum arguments reached');
  
  const judgeResponses = [
    "The court acknowledges this additional argument. However, the fundamental legal principles remain unchanged. The original verdict stands with minor clarification regarding procedural matters.",
    "This argument presents a valid perspective that warrants consideration. The court will factor this into the final decision, though it does not materially alter the core findings.",
    "While the point raised is noted, the court finds that it does not introduce new evidence or legal authority sufficient to overturn the preliminary ruling. The verdict is affirmed.",
    "The court appreciates the thoroughness of this submission. Upon review, one aspect of the original decision requires modification to account for the precedent cited.",
    "After deliberation on this counter-argument, the court maintains its position. The legal standards applied are appropriate and the factual findings remain undisturbed."
  ];
  
  const newArg: Argument = {
    id: `arg${caseData.arguments.length + 1}`,
    side,
    content: argument,
    submittedAt: new Date().toISOString(),
    judgeResponse: judgeResponses[caseData.arguments.length % judgeResponses.length]
  };
  
  caseData.arguments.push(newArg);
  return newArg;
};

export { users, cases };
