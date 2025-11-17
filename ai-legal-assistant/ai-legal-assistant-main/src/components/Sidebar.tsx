import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Scale, LayoutDashboard, Briefcase, PlusCircle, LogOut } from 'lucide-react';
import { toast } from 'sonner';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Scale className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AI Judge</h1>
            <p className="text-xs text-muted-foreground">Legal System</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 p-4 space-y-2">
        <Link to="/dashboard">
          <Button
            variant={isActive('/dashboard') ? 'default' : 'ghost'}
            className="w-full justify-start"
          >
            <LayoutDashboard className="h-4 w-4 mr-3" />
            Dashboard
          </Button>
        </Link>

        <Link to="/cases">
          <Button
            variant={isActive('/cases') ? 'default' : 'ghost'}
            className="w-full justify-start"
          >
            <Briefcase className="h-4 w-4 mr-3" />
            My Cases
          </Button>
        </Link>

        <Link to="/cases/new">
          <Button
            variant={isActive('/cases/new') ? 'default' : 'ghost'}
            className="w-full justify-start"
          >
            <PlusCircle className="h-4 w-4 mr-3" />
            Create Case
          </Button>
        </Link>
      </div>

      <div className="p-4 border-t border-border">
        <div className="mb-4 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {user.role === 'LawyerA' ? 'Petitioner' : 'Respondent'} Attorney
          </p>
        </div>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
