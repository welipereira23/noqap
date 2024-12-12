import { useEffect, useCallback } from 'react';
import errorLogger from '../lib/errorLogger';

declare global {
  interface Window {
    google?: any;
    handleGoogleCallback?: (response: any) => void;
  }
}

interface GoogleButtonProps {
  onSuccess: (params: { email: string; name: string; sub: string }) => Promise<void>;
  onError: (error: Error) => void;
}

export function useGoogleButton({ onSuccess, onError }: GoogleButtonProps) {
  const initializeButton = useCallback(() => {
    if (!window.google?.accounts?.id) {
      console.log('[Google] API ainda não carregada');
      return false;
    }

    try {
      // Limpar qualquer instância anterior
      window.google.accounts.id.cancel();
      
      // Reinicializar
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: window.handleGoogleCallback,
      });
      
      // Renderizar o botão
      const buttonContainer = document.getElementById('googleButton');
      if (buttonContainer) {
        buttonContainer.innerHTML = '';
        window.google.accounts.id.renderButton(
          buttonContainer,
          { theme: 'outline', size: 'large', width: 280 }
        );
      }
      return true;
    } catch (error) {
      console.error('[Google] Erro ao inicializar botão:', error);
      errorLogger.logError(error as Error, 'useGoogleButton:initializeButton');
      return false;
    }
  }, []);

  useEffect(() => {
    // Registrar callback
    window.handleGoogleCallback = async (response) => {
      try {
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
        
        await onSuccess({ email, name, sub });
      } catch (error) {
        console.error('[Google] Erro no callback:', error);
        onError(error as Error);
        errorLogger.logError(error as Error, 'useGoogleButton:handleCallback');
      }
    };

    // Tentar inicializar imediatamente
    const initialized = initializeButton();

    // Se não conseguiu inicializar, tentar novamente quando a API carregar
    if (!initialized) {
      const checkGoogleApi = setInterval(() => {
        if (initializeButton()) {
          clearInterval(checkGoogleApi);
        }
      }, 100);

      return () => {
        clearInterval(checkGoogleApi);
      };
    }

    return () => {
      window.handleGoogleCallback = undefined;
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [initializeButton, onSuccess, onError]);
}
