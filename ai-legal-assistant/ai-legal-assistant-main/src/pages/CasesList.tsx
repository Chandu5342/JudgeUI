import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fakeGetMyCases } from '@/services/fakeApi';
import { PlusCircle } from 'lucide-react';

const CasesList = () => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const data = await fakeGetMyCases(user.id);
      setCases(data);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      draft: 'bg-muted',
      submitted: 'bg-blue-500',
      in_hearing: 'bg-accent',
      closed: 'bg-green-600'
    };
    return colors[status] || 'bg-muted';
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Cases</h1>
              <p className="text-muted-foreground">Manage all your legal cases</p>
            </div>
            <Link to="/cases/new">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create New Case
              </Button>
            </Link>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Loading cases...
                </CardContent>
              </Card>
            ) : cases.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No cases found</p>
                  <Link to="/cases/new">
                    <Button>Create Your First Case</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              cases.map(c => (
                <Card key={c.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{c.title}</CardTitle>
                        <CardDescription className="mb-3">{c.description}</CardDescription>
                        <div className="flex gap-4 text-sm">
                          <span>
                            <span className="text-muted-foreground">Category:</span>{' '}
                            <span className="font-medium">{c.category}</span>
                          </span>
                          <span>
                            <span className="text-muted-foreground">Jurisdiction:</span>{' '}
                            <span className="font-medium">{c.jurisdiction}</span>
                          </span>
                          <span>
                            <span className="text-muted-foreground">Documents:</span>{' '}
                            <span className="font-medium">{c.documents.length}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <Badge className={getStatusColor(c.status)}>
                          {c.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Link to={`/cases/${c.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasesList;
