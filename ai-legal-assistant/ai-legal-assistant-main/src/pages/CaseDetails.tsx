import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { fakeGetCaseDetails, fakeJoinCase, fakeAddDocument, fakeUpdateCaseStatus, users } from '@/services/fakeApi';
import { Scale, FileText, Upload, Users } from 'lucide-react';

const CaseDetails = () => {
  const { caseId } = useParams();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [documentText, setDocumentText] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadCase();
  }, [caseId]);

  const loadCase = async () => {
    try {
      const data = await fakeGetCaseDetails(caseId!);
      setCaseData(data);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCase = async () => {
    try {
      await fakeJoinCase(caseId!, user.id);
      toast.success('Joined case as Lawyer B');
      loadCase();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to join');
    }
  };

  const handleUploadDocument = async () => {
    if (!documentText || !documentType) {
      toast.error('Please fill all fields');
      return;
    }
    
    setUploadingDoc(true);
    try {
      await fakeAddDocument(caseId!, documentText, documentType, user.name);
      toast.success('Document uploaded');
      setDocumentText('');
      setDocumentType('');
      loadCase();
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleStatusChange = async (status: any) => {
    try {
      await fakeUpdateCaseStatus(caseId!, status);
      toast.success('Status updated');
      loadCase();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const getLawyerName = (id: string | null) => {
    if (!id) return 'Not assigned';
    const lawyer = users.find(u => u.id === id);
    return lawyer?.name || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Case not found</p>
        </div>
      </div>
    );
  }

  const isLawyerA = caseData.lawyerA === user.id;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">{caseData.title}</h1>
              <p className="text-muted-foreground mb-4">{caseData.description}</p>
              <div className="flex gap-4">
                <Badge variant="outline">{caseData.category}</Badge>
                <Badge variant="outline">{caseData.jurisdiction}</Badge>
              </div>
            </div>
            <div className="flex gap-3">
              <Badge className={`text-base px-4 py-2 ${
                caseData.status === 'in_hearing' ? 'bg-accent' :
                caseData.status === 'closed' ? 'bg-green-600' : 'bg-muted'
              }`}>
                {caseData.status.replace('_', ' ').toUpperCase()}
              </Badge>
              {caseData.status === 'in_hearing' && (
                <Link to={`/cases/${caseId}/hearing`}>
                  <Button>
                    <Scale className="h-4 w-4 mr-2" />
                    Enter Hearing
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="grid gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Case Parties
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Lawyer A (Petitioner)</p>
                  <p className="font-medium">{getLawyerName(caseData.lawyerA)}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Lawyer B (Respondent)</p>
                  <p className="font-medium">{getLawyerName(caseData.lawyerB)}</p>
                  {!caseData.lawyerB && user.role === 'LawyerB' && (
                    <Button size="sm" className="mt-2" onClick={handleJoinCase}>
                      Join as Lawyer B
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {isLawyerA && (
              <Card>
                <CardHeader>
                  <CardTitle>Case Status Management</CardTitle>
                  <CardDescription>Only Lawyer A can update case status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label>Update Status</Label>
                      <Select value={caseData.status} onValueChange={handleStatusChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="submitted">Submitted</SelectItem>
                          <SelectItem value="in_hearing">In Hearing</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents ({caseData.documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {caseData.documents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No documents uploaded yet</p>
                ) : (
                  <div className="space-y-3">
                    {caseData.documents.map((doc: any) => (
                      <div key={doc.id} className="p-4 bg-muted rounded-lg flex justify-between items-center">
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Type: {doc.type} • Uploaded by: {doc.uploadedBy}
                          </p>
                        </div>
                        <Badge variant="outline">{new Date(doc.uploadedAt).toLocaleDateString()}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Document
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Document Type</Label>
                  <Select value={documentType} onValueChange={setDocumentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="evidence">Evidence</SelectItem>
                      <SelectItem value="legal">Legal Document</SelectItem>
                      <SelectItem value="witness">Witness Statement</SelectItem>
                      <SelectItem value="expert">Expert Opinion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Document Content (Text)</Label>
                  <Textarea
                    placeholder="Paste document text here..."
                    rows={5}
                    value={documentText}
                    onChange={(e) => setDocumentText(e.target.value)}
                  />
                </div>
                <Button onClick={handleUploadDocument} disabled={uploadingDoc}>
                  {uploadingDoc ? 'Uploading...' : 'Upload Document'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
