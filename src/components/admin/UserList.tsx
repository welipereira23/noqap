import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { Loader2, Lock, Unlock } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  is_blocked: boolean;
}

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      console.log('[UserList] Carregando usuários...');
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, is_blocked')
        .order('email');

      if (error) throw error;
      
      console.log('[UserList] Usuários carregados:', data);
      setUsers(data || []);
    } catch (error) {
      console.error('[UserList] Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar lista de usuários');
    } finally {
      setLoading(false);
    }
  };

  const toggleBlock = async (userId: string, currentStatus: boolean) => {
    try {
      setUpdating(userId);
      console.log('[UserList] Alterando status do usuário:', userId, 'para:', !currentStatus);
      
      const { error: blockError } = await supabase
        .from('users')
        .update({ 
          is_blocked: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (blockError) throw blockError;

      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_blocked: !currentStatus }
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
      
      {/* Versão Desktop */}
      <div className="hidden md:block bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className={user.is_blocked ? 'bg-red-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.name || 'Sem nome'}
                  </div>
                </td>
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
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.email !== 'wp22santos@gmail.com' && (
                    <button
                      onClick={() => toggleBlock(user.id, user.is_blocked)}
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

      {/* Versão Mobile */}
      <div className="md:hidden space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className={`bg-white shadow rounded-lg p-4 ${
              user.is_blocked ? 'bg-red-50' : ''
            }`}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {user.name || 'Sem nome'}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.is_blocked
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {user.is_blocked ? 'Bloqueado' : 'Ativo'}
                </span>
              </div>
              
              {user.email !== 'wp22santos@gmail.com' && (
                <div className="mt-3">
                  <button
                    onClick={() => toggleBlock(user.id, user.is_blocked)}
                    disabled={updating === user.id}
                    className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
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
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
