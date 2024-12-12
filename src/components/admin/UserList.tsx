import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { Loader2, Lock, Unlock, Search, Clock10 } from 'lucide-react';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type User = {
  id: string;
  email: string;
  name: string;
  is_blocked: boolean;
  created_at: string;
  last_unblocked_at: string | null;
  updated_at: string;
};

type ConfirmationDialog = {
  isOpen: boolean;
  userId: string;
  email: string;
  currentStatus: boolean;
} | null;

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialog>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const loadUsers = async () => {
    try {
      console.log('[UserList] Carregando usuários...');
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, is_blocked, created_at, last_unblocked_at, updated_at')
        .order('email');

      if (error) {
        console.error('[UserList] Erro ao carregar usuários:', error);
        toast.error('Erro ao carregar lista de usuários');
        throw error;
      }
      
      console.log('[UserList] Usuários carregados:', data);
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error('[UserList] Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar lista de usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = (userId: string, email: string, currentStatus: boolean) => {
    setConfirmDialog({
      isOpen: true,
      userId,
      email,
      currentStatus
    });
  };

  const toggleBlock = async () => {
    if (!confirmDialog) return;

    const { userId, currentStatus } = confirmDialog;
    setConfirmDialog(null);

    try {
      setUpdating(userId);
      console.log('[UserList] Alterando status do usuário:', userId, 'para:', !currentStatus);
      
      const updates = { 
        is_blocked: !currentStatus,
        updated_at: new Date().toISOString(),
        ...(currentStatus && { last_unblocked_at: new Date().toISOString() })
      };

      const { error: blockError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (blockError) {
        console.error('[UserList] Erro ao atualizar status:', blockError);
        toast.error('Erro ao atualizar status do usuário');
        throw blockError;
      }

      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_blocked: !currentStatus, last_unblocked_at: currentStatus ? new Date().toISOString() : user.last_unblocked_at }
          : user
      ));

      toast.success(currentStatus ? 'Usuário desbloqueado com sucesso' : 'Usuário bloqueado com sucesso');
    } catch (error) {
      console.error('[UserList] Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do usuário');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Usuários</h1>
      
      {/* Search Filter */}
      <div className="mb-4 relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Filtrar por email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* Desktop Version */}
      <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tempo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className={user.is_blocked ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.is_blocked
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.is_blocked ? 'Bloqueado' : 'Ativo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock10 className="h-4 w-4 mr-1" />
                      Registrado há {formatDistanceToNow(parseISO(user.created_at), { locale: ptBR })}
                    </div>
                    {!user.is_blocked && user.last_unblocked_at && (
                      <div className="flex items-center text-sm text-emerald-600">
                        <Clock10 className="h-4 w-4 mr-1" />
                        Desbloqueado há {formatDistanceToNow(parseISO(user.last_unblocked_at), { locale: ptBR })}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.email !== 'wp22santos@gmail.com' && (
                    <button
                      onClick={() => handleToggleBlock(user.id, user.email, user.is_blocked)}
                      disabled={updating === user.id}
                      className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
                        user.is_blocked
                          ? 'text-green-700 bg-green-100 hover:bg-green-200'
                          : 'text-red-700 bg-red-100 hover:bg-red-200'
                      } ${updating === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {updating === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : user.is_blocked ? (
                        <><Unlock className="h-4 w-4 mr-2" /> Desbloquear</>
                      ) : (
                        <><Lock className="h-4 w-4 mr-2" /> Bloquear</>
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Version */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className={`bg-white rounded-lg shadow p-4 ${
              user.is_blocked ? 'bg-red-50' : ''
            }`}
          >
            <div className="flex flex-col space-y-3">
              <div className="text-sm text-gray-500">{user.email}</div>
              <div className="space-y-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  user.is_blocked
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {user.is_blocked ? 'Bloqueado' : 'Ativo'}
                </span>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock10 className="h-4 w-4 mr-1" />
                    Registrado há {formatDistanceToNow(parseISO(user.created_at), { locale: ptBR })}
                  </div>
                  {!user.is_blocked && user.last_unblocked_at && (
                    <div className="flex items-center text-sm text-emerald-600">
                      <Clock10 className="h-4 w-4 mr-1" />
                      Desbloqueado há {formatDistanceToNow(parseISO(user.last_unblocked_at), { locale: ptBR })}
                    </div>
                  )}
                </div>
              </div>
              {user.email !== 'wp22santos@gmail.com' && (
                <button
                  onClick={() => handleToggleBlock(user.id, user.email, user.is_blocked)}
                  disabled={updating === user.id}
                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
                    user.is_blocked
                      ? 'text-green-700 bg-green-100 hover:bg-green-200'
                      : 'text-red-700 bg-red-100 hover:bg-red-200'
                  } ${updating === user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {updating === user.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : user.is_blocked ? (
                    <><Unlock className="h-4 w-4 mr-2" /> Desbloquear</>
                  ) : (
                    <><Lock className="h-4 w-4 mr-2" /> Bloquear</>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!confirmDialog}
        onClose={() => setConfirmDialog(null)}
        onConfirm={toggleBlock}
        title={confirmDialog?.currentStatus ? 'Desbloquear Usuário' : 'Bloquear Usuário'}
        description={
          confirmDialog?.currentStatus
            ? `Tem certeza que deseja desbloquear o usuário ${confirmDialog?.email}?`
            : `Tem certeza que deseja bloquear o usuário ${confirmDialog?.email}? O usuário não poderá acessar o sistema até ser desbloqueado.`
        }
        confirmText={confirmDialog?.currentStatus ? 'Desbloquear' : 'Bloquear'}
        type={confirmDialog?.currentStatus ? 'warning' : 'danger'}
      />
    </div>
  );
}
