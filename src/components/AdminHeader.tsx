import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@untitledui/base/buttons/button';
import { LogOut01 } from '@untitledui/icons';
import { useAuth } from '../contexts/AuthContext';

interface AdminHeaderProps {
  title?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title = 'UX Research Panel' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-primary border-b border-secondary px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-primary">{title}</h1>
        
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm text-tertiary">
              {user.email}
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            onPress={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut01 className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
