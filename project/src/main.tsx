import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { logger } from './utils/logger';

// Iniciar diagnóstico
logger.runDiagnostics().catch(error => {
  console.error('Failed to run diagnostics:', error);
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  logger.error('Root element not found');
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
