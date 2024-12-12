import { useEffect, useState } from 'react';

export function GoogleScriptLoader() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Evitar carregar múltiplas vezes
    if (window.google || document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.id = 'google-client-script';
    
    script.onload = () => {
      console.log('[Google] Script carregado com sucesso');
      setIsLoaded(true);
    };

    script.onerror = (error) => {
      console.error('[Google] Erro ao carregar script:', error);
      // Tentar novamente em caso de erro
      setTimeout(() => {
        document.head.appendChild(script);
      }, 2000);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup apenas se o componente for desmontado antes do script carregar
      if (!isLoaded) {
        script.remove();
      }
    };
  }, []);

  return null;
}
