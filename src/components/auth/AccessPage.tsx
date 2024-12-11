import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useStore } from '../../store/useStore';
import { toast } from 'sonner';
import { Copy, Clock, LogOut } from 'lucide-react';

export function AccessPage() {
  const navigate = useNavigate();
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      if (!user.is_blocked) {
        navigate('/');
        return;
      }
    };

    checkAccess();
  }, [user]);

  const handleLogout = async () => {
    try {
      console.log('[AccessPage] Iniciando logout');
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('[AccessPage] Erro ao fazer logout:', error);
      toast.error('Erro ao fazer logout. Tente novamente.');
    }
  };

  const copyPixLink = () => {
    navigator.clipboard.writeText('https://nubank.com.br/cobrar/xbbuq/6756ed14-3da5-47c4-bc13-3ae656ca4aa2');
    toast.success('Link do PIX copiado!');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
            <span className="text-lg sm:text-xl font-semibold text-gray-900">Controle de Horas</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user?.email === 'wp22santos@gmail.com' && (
              <button
                onClick={() => navigate('/admin')}
                className="px-2 py-1 sm:p-2 text-sm sm:text-base text-gray-500 hover:text-gray-700"
              >
                Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-gray-700 flex items-center gap-1 sm:gap-2"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-col lg:flex-row flex-1 h-[calc(100vh-4rem)]">
        {/* Seção Promocional - Visível apenas em telas grandes */}
        <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 text-white p-8 items-center justify-center">
          <div className="max-w-md">
            <h2 className="text-3xl font-bold mb-4">
              Controle total da sua carga horária por menos de R$ 5 reais por mês.
            </h2>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 flex items-center justify-center p-4 bg-white overflow-y-auto">
          <div className="w-full max-w-sm bg-white rounded-lg p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-4 sm:mb-6 text-center">
              Acesso ao Sistema
            </h1>
            
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <p className="text-base sm:text-lg text-zinc-700 text-center leading-relaxed">
                Controle total da sua carga horária de maneira fácil e rápida.
              </p>
              <p className="text-lg sm:text-xl font-semibold text-zinc-800 text-center">
                Por menos de R$ 5 reais por mês.
              </p>
              <p className="text-sm sm:text-base text-zinc-600 text-center">
                Faça o pagamento e tenha acesso por{' '}
                <span className="font-semibold text-zinc-800">1 ANO</span> ao sistema.
              </p>
            </div>

            <div className="mb-6 flex justify-center">
              <img
                src="/qr-code-payment.png"
                alt="QR Code para pagamento"
                className="w-36 h-36 sm:w-48 sm:h-48 rounded-lg"
              />
            </div>

            <button
              onClick={copyPixLink}
              className="w-full bg-zinc-800 text-white rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2 mb-3 sm:mb-4"
            >
              <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
              Copiar Link do PIX
            </button>

            <a
              href="https://wa.me/553488243778?text=Olá! Acabei de fazer o pagamento para ter acesso ao sistema."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-600 text-white rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <img
                src="/whatsapp.svg"
                alt="WhatsApp"
                className="w-5 h-5 sm:w-6 sm:h-6"
              />
              Enviar comprovante no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
