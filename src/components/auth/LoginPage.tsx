import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import errorLogger from '../../lib/errorLogger';
import { Clock } from 'lucide-react';

export function LoginPage() {
  const { signInWithGoogle, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Carregar script do Google
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.nonce = 'your-nonce-value'; // Adicione um nonce se necessário
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleLogin = async (response: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!response?.credential) {
        throw new Error('Credenciais do Google não fornecidas');
      }

      // Decodificar o token JWT
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const { email, name, sub } = JSON.parse(jsonPayload);
      
      await signInWithGoogle({ email, name, sub });
    } catch (error) {
      console.error('[LoginPage] Erro no login com Google:', error);
      setError('Erro ao fazer login com Google. Tente novamente.');
      errorLogger.logError(error as Error, 'LoginPage:handleGoogleLogin');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (!name) {
          throw new Error('Nome é obrigatório');
        }
        await signUp(email, password, name);
        // Após cadastro, fazer login automaticamente
        await signIn(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      console.error('[LoginPage] Erro no formulário:', error);
      setError((error as Error).message);
      errorLogger.logError(error as Error, 'LoginPage:handleSubmit');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-indigo-500 to-indigo-800 flex flex-col justify-center px-4 py-8 md:py-12">
      {/* Padrão de fundo decorativo */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:24px_24px]" />
      </div>
      
      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm mb-6">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
            NoQap
          </h2>
          <p className="text-indigo-200">
            {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}{' '}
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-white hover:text-indigo-100 transition-colors underline"
            >
              {isSignUp ? 'Faça login' : 'Cadastre-se gratuitamente'}
            </button>
          </p>
        </div>

        {/* Card do Formulário */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-xl border border-white/20">
          {/* Botão do Google */}
          <div
            id="g_id_onload"
            data-client_id={import.meta.env.VITE_GOOGLE_CLIENT_ID}
            data-callback={handleGoogleLogin}
            data-auto_prompt="false"
          ></div>
          <div
            className="g_id_signin"
            data-type="standard"
            data-size="large"
            data-theme="outline"
            data-text="sign_in_with"
            data-shape="rectangular"
            data-logo_alignment="left"
          ></div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 text-white/80">
                ou {isSignUp ? 'cadastre-se' : 'faça login'} com email
              </span>
            </div>
          </div>

          {error && (
            <div className="mb-6 text-sm text-red-200 bg-red-500/20 p-3 rounded-xl border border-red-500/30">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {isSignUp && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-white/90 mb-1.5"
                >
                  Nome completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={isSignUp}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white/90 mb-1.5"
              >
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white/90 mb-1.5"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                isSignUp ? 'Criar conta' : 'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}