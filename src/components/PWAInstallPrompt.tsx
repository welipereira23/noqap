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
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20 shadow-lg backdrop-blur-sm">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3 flex-1">
          {instructions.icon}
          <div>
            <h3 className="font-semibold text-primary-foreground/90">
              {instructions.title}
            </h3>
            <p className="text-sm text-primary-foreground/70">
              {instructions.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={isIOS ? handleClose : handleInstallClick}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
          >
            {instructions.buttonText}
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-primary/10 rounded-full transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-primary-foreground/70" />
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

  // Detecta o modo standalone e navegador imediatamente
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

    // Tenta mostrar imediatamente se o evento já aconteceu
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

  const getInstructions = () => {
    if (isIOS) {
      return {
        icon: <Share2 className="h-6 w-6 text-primary" />,
        title: "Instale o NoQap no seu iPhone/iPad",
        description: "Toque no botão 'Compartilhar' e depois em 'Adicionar à Tela de Início'",
        buttonText: "Ver Como Fazer"
      };
    }

    switch (browser) {
      case 'brave':
        return {
          icon: <Download className="h-6 w-6 text-primary" />,
          title: "Instale o NoQap no Brave",
          description: "Clique no botão de instalação na barra de endereço",
          buttonText: "Instalar App"
        };
      case 'firefox':
        return {
          icon: <Download className="h-6 w-6 text-primary" />,
          title: "Instale o NoQap no Firefox",
          description: "Clique nos três pontos (...) e depois em 'Instalar'",
          buttonText: "Instalar App"
        };
      case 'edge':
      case 'chrome':
      case 'opera':
      case 'samsung':
        return {
          icon: <Download className="h-6 w-6 text-primary" />,
          title: "Instale o NoQap para acesso rápido",
          description: "Acesse rapidamente direto do seu dispositivo",
          buttonText: "Instalar App"
        };
      default:
        return {
          icon: <Download className="h-6 w-6 text-primary" />,
          title: "Instale o NoQap no seu dispositivo",
          description: "Adicione à tela inicial para acesso rápido",
          buttonText: "Instalar App"
        };
    }
  };

  const instructions = getInstructions();

  return (
    <PromptContent
      instructions={instructions}
      isIOS={isIOS}
      handleInstallClick={handleInstallClick}
      handleClose={handleClose}
    />
  );
}
