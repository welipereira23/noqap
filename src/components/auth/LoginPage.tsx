import { useState, memo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useGoogleButton } from '../../hooks/useGoogleButton';
import errorLogger from '../../lib/errorLogger';
import { Clock } from 'lucide-react';

// Componente do background memoizado para evitar re-renders desnecessários
const Background = memo(() => (
  <div className="fixed inset-0">
    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500 to-indigo-800" />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:24px_24px] opacity-10" />
  </div>
));

Background.displayName = 'Background';

// Componente do formulário memoizado
const LoginForm = memo(({ 
  isSignUp, 
  email, 
  setEmail, 
  password, 
  setPassword, 
  confirmPassword, 
  setConfirmPassword, 
  showPassword, 
  setShowPassword, 
  showConfirmPassword, 
  setShowConfirmPassword, 
  error, 
  isLoading, 
  handleSubmit 
}: any) => (
  <form onSubmit={handleSubmit} className="space-y-5">
    <div>
      <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-1.5">
        E-mail
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm transform-gpu"
        placeholder="seu@email.com"
      />
    </div>

    <div>
      <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-1.5">
        Senha
      </label>
      <div className="relative">
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm transform-gpu"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
        >
          {showPassword ? 'Ocultar' : 'Mostrar'}
        </button>
      </div>
    </div>

    {isSignUp && (
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-1.5">
          Confirmar Senha
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent text-sm transform-gpu"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
          >
            {showConfirmPassword ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
      </div>
    )}

    {error && (
      <div className="text-sm text-red-200 bg-red-500/20 p-3 rounded-xl border border-red-500/30">
        {error}
      </div>
    )}

    <button
      type="submit"
      disabled={isLoading}
      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 disabled:opacity-50 transition-colors transform-gpu"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      ) : (
        isSignUp ? 'Criar conta' : 'Entrar'
      )}
    </button>
  </form>
));

LoginForm.displayName = 'LoginForm';

export function LoginPage() {
  const { signInWithGoogle, signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useGoogleButton({
    onSuccess: async ({ email, name, sub }) => {
      try {
        setIsLoading(true);
        setError(null);
        await signInWithGoogle({ email, name, sub });
      } catch (error) {
        console.error('[LoginPage] Erro no login com Google:', error);
        setError('Erro ao fazer login com Google. Tente novamente.');
        errorLogger.logError(error as Error, 'LoginPage:handleGoogleLogin');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      setError('Erro ao fazer login com Google. Tente novamente.');
      errorLogger.logError(error, 'LoginPage:googleError');
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem');
        }
        await signUp(email, password, email.split('@')[0]);
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
    <div className="min-h-screen relative flex flex-col justify-center px-4 py-8 md:py-12 overflow-hidden">
      <Background />
      
      {/* Conteúdo */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 mb-6 transform-gpu">
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
        <div className="bg-white/10 rounded-2xl p-6 md:p-8 shadow-xl border border-white/20 transform-gpu">
          {/* Botão do Google */}
          <div className="flex justify-center mb-6">
            <div id="googleButton"></div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white/60">ou continue com</span>
            </div>
          </div>

          <LoginForm
            isSignUp={isSignUp}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            error={error}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}