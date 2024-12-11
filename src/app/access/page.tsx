import React from 'react';
import { Lock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

export function AccessPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Erro ao fazer logout. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-rose-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Acesso Bloqueado
        </h1>
        
        <p className="text-slate-600 mb-6">
          Sua conta está temporariamente bloqueada por falta de pagamento.
        </p>

        <div className="bg-slate-50 p-4 rounded-lg mb-6">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Valor:</span>
              <span className="text-sm text-slate-600">R$ 29,90</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-700">Chave PIX (CNPJ):</span>
              <span className="text-sm text-slate-600">48.173.612/0001-02</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-6">
          Após o pagamento, envie o comprovante para{' '}
          <a
            href="mailto:contato@noqap.app"
            className="text-indigo-600 hover:text-indigo-500"
          >
            contato@noqap.app
          </a>
        </p>

        <button
          onClick={handleSignOut}
          className="w-full bg-rose-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Voltar para Login
        </button>
      </div>
    </div>
  );
}
