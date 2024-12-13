import { useState, useEffect } from 'react';
import { X, Download, Share2 } from 'lucide-react';

type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera' | 'samsung' | 'other';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [browser, setBrowser] = useState<BrowserType>('other');
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detecta iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // Detecta o navegador
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('chrome')) setBrowser('chrome');
    else if (ua.includes('firefox')) setBrowser('firefox');
    else if (ua.includes('safari')) setBrowser('safari');
    else if (ua.includes('edge')) setBrowser('edge');
    else if (ua.includes('opera')) setBrowser('opera');
    else if (ua.includes('samsungbrowser')) setBrowser('samsung');

    // Verifica se o app já está instalado
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isInstalled) {
      setShowPrompt(false);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Verifica se já foi fechado anteriormente
    const wasPromptClosed = localStorage.getItem('pwa-prompt-closed');
    if (wasPromptClosed) {
      setShowPrompt(false);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

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
    localStorage.setItem('pwa-prompt-closed', 'true');
  };

  if (!showPrompt) return null;

  const getInstructions = () => {
    if (isIOS) {
      return {
        icon: <Share2 className="h-5 w-5 text-yellow-600" />,
        title: "Instale o NoQap no seu iPhone/iPad",
        description: "Toque no botão 'Compartilhar' e depois em 'Adicionar à Tela de Início'",
        buttonText: "Ver Como Fazer"
      };
    }

    switch (browser) {
      case 'firefox':
        return {
          icon: <Download className="h-5 w-5 text-yellow-600" />,
          title: "Instale o NoQap no Firefox",
          description: "Clique nos três pontos (...) e depois em 'Instalar'",
          buttonText: "Instalar App"
        };
      case 'edge':
      case 'chrome':
      case 'opera':
      case 'samsung':
        return {
          icon: <Download className="h-5 w-5 text-yellow-600" />,
          title: "Instale o NoQap para acesso rápido",
          description: "Acesse rapidamente direto do seu dispositivo",
          buttonText: "Instalar App"
        };
      default:
        return {
          icon: <Download className="h-5 w-5 text-yellow-600" />,
          title: "Instale o NoQap no seu dispositivo",
          description: "Adicione à tela inicial para acesso rápido",
          buttonText: "Instalar"
        };
    }
  };

  const instructions = getInstructions();

  return (
    <div className="sticky top-0 z-50 w-full bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {instructions.icon}
          <div>
            <p className="text-sm font-medium text-yellow-800">
              {instructions.title}
            </p>
            <p className="text-sm text-yellow-600">
              {instructions.description}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isIOS && (
            <button
              onClick={handleInstallClick}
              className="px-4 py-1.5 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              {instructions.buttonText}
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-1 rounded-md hover:bg-yellow-100"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-yellow-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
