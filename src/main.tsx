import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { checkEnvVars } from './utils/env';

async function initializeApp() {
  try {
    console.log('=== Initialization Debug ===');
    console.log('Environment:', import.meta.env.MODE);
    console.log('Base URL:', import.meta.env.BASE_URL);
    console.log('API URL:', import.meta.env.VITE_API_URL);
    
    // Carregar script do Google antecipadamente
    const loadGoogleScript = new Promise<void>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('[Google] Script carregado com sucesso');
        resolve();
      };
      document.head.appendChild(script);
    });
    
    // Verificar variáveis de ambiente
    await checkEnvVars();
    console.log('Environment variables validated');

    // Carregar script do Google em paralelo com a inicialização do app
    loadGoogleScript.catch(error => {
      console.error('[Google] Erro ao carregar script:', error);
    });

    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    console.log('Root element found');
    const root = createRoot(rootElement);
    
    root.render(
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>
    );

    console.log('App rendered successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    // Mostrar erro para o usuário de forma amigável
    const rootElement = document.getElementById('root') || document.body;
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: system-ui;">
        <h1>Oops! Something went wrong</h1>
        <p>We're having trouble loading the application. Please try again later.</p>
        <div style="margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 4px; text-align: left;">
          <strong>Debug Information:</strong>
          <pre style="margin: 10px 0;">${error instanceof Error ? error.message : 'Unknown error'}</pre>
          ${import.meta.env.DEV ? `<pre style="margin: 10px 0;">${error instanceof Error ? error.stack : ''}</pre>` : ''}
        </div>
      </div>
    `;
  }
}

// Aguardar o DOM estar completamente carregado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded event fired');
    initializeApp();
  });
} else {
  console.log('DOM already loaded');
  initializeApp();
}
