import { Outlet, useNavigate } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import { Tabs } from './common/Tabs';
import { useBlockStatus } from '../hooks/useBlockStatus';

export function Layout() {
  const navigate = useNavigate();
  const { user, setUser } = useStore();
  const currentPath = window.location.pathname;

  console.log('=== Layout Debug ===');
  console.log('User:', user);
  console.log('Current Path:', currentPath);

  // Monitorar status de bloqueio
  useBlockStatus();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Erro ao fazer logout. Tente novamente.');
    }
  };

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/',
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-semibold text-gray-900">Controle de Horas</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user?.email === 'wp22santos@gmail.com' && (
              <button
                onClick={() => navigate('/admin')}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <Tabs
            tabs={tabs}
            activeTab={currentPath === '/' ? 'dashboard' : currentPath.split('/')[1]}
            onChange={(tabId) => navigate(tabId === 'dashboard' ? '/' : `/${tabId}`)}
          />
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}