import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { checkEnvVars } from './utils/env';

async function initializeApp() {
  try {
    // Verificar variáveis de ambiente
    await checkEnvVars();

    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error('Root element not found');
    }

    const root = createRoot(rootElement);
    
    root.render(
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>
    );

    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    // Mostrar erro para o usuário de forma amigável
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; text-align: center; font-family: system-ui;">
          <h1>Oops! Something went wrong</h1>
          <p>We're having trouble loading the application. Please try again later.</p>
          ${import.meta.env.DEV ? `<pre style="text-align: left; background: #f5f5f5; padding: 10px; border-radius: 4px;">${error}</pre>` : ''}
        </div>
      `;
    }
  }
}

// Aguardar o DOM estar completamente carregado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
  });
} else {
  initializeApp();
}
