import { useState, useEffect, memo } from 'react';
import { X, Download, Share2 } from 'lucide-react';
import '../styles/animations.css';

type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'samsung' | 'brave' | 'other';

// Memoize o conteúdo do prompt
const PromptContent = memo(({ 
  instructions, 
  isIOS, 
  handleInstallClick, 
  handleClose 
}: {
  instructions: any;
  isIOS: boolean;
  handleInstallClick: () => void;
  handleClose: () => void;
}) => (
  <div className="fixed top-0 left-0 right-0 z-50 animate-slideDown">
    <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4">
        <div className="flex items-center gap-3 flex-1 w-full">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
            {instructions.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {instructions.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {instructions.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <button
            onClick={isIOS ? handleClose : handleInstallClick}
            className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 text-sm sm:text-base"
          >
            {instructions.buttonText}
          </button>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  </div>
));

PromptContent.displayName = 'PromptContent';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [browser, setBrowser] = useState<BrowserType>('other');
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Detecta o modo standalone e navegador uma única vez
  useEffect(() => {
    const detectBrowser = () => {
      const ua = navigator.userAgent.toLowerCase();
      if (ua.includes('brave')) return 'brave';
      if (ua.includes('chrome')) return 'chrome';
      if (ua.includes('firefox')) return 'firefox';
      if (ua.includes('safari')) return 'safari';
      if (ua.includes('edg')) return 'edge';
      if (ua.includes('opera')) return 'opera';
      if (ua.includes('samsungbrowser')) return 'samsung';
      return 'other';
    };

    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    
    setIsIOS(isIOSDevice);
    setIsStandalone(isInStandaloneMode);
    setBrowser(detectBrowser());

    // Se não estiver em modo standalone e for iOS, mostra imediatamente
    if (!isInStandaloneMode && isIOSDevice) {
      setShowPrompt(true);
    }
  }, []);

  // Gerencia o evento beforeinstallprompt
  useEffect(() => {
    if (isStandalone) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    
    // Verifica se o evento já foi disparado
    if ((window as any).deferredPrompt) {
      handler((window as any).deferredPrompt);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || isStandalone) return null;

  const instructions = isIOS 
    ? {
        icon: <Share2 className="h-5 w-5 text-indigo-600" />,
        title: "Instale o NoQap",
        description: "Toque em 'Compartilhar' e depois 'Adicionar à Tela de Início'",
        buttonText: "Entendi"
      }
    : {
        icon: <Download className="h-5 w-5 text-indigo-600" />,
        title: browser === 'brave' ? "Instale o NoQap no Brave" : "Instale o NoQap",
        description: browser === 'brave' 
          ? "Clique no botão de instalação na barra de endereço"
          : "Adicione à tela inicial para acesso rápido",
        buttonText: "Instalar App"
      };

  return (
    <PromptContent
      instructions={instructions}
      isIOS={isIOS}
      handleInstallClick={handleInstallClick}
      handleClose={handleClose}
    />
  );
}
