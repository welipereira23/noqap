import { env } from '../config/env';

interface LogData {
  type: 'error' | 'info' | 'warn';
  message: string;
  details?: unknown;
  timestamp: string;
}

class Logger {
  private logs: LogData[] = [];

  constructor() {
    this.setupErrorHandling();
  }

  private setupErrorHandling() {
    window.onerror = (message, source, lineno, colno, error) => {
      this.error('Global Error Handler', {
        message,
        source,
        lineno,
        colno,
        error: error?.stack
      });
    };

    window.onunhandledrejection = (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason
      });
    };
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private addLog(type: LogData['type'], message: string, details?: unknown) {
    const log: LogData = {
      type,
      message,
      details,
      timestamp: this.formatTimestamp()
    };
    this.logs.push(log);
    console[type](message, details);
  }

  info(message: string, details?: unknown) {
    this.addLog('info', message, details);
  }

  warn(message: string, details?: unknown) {
    this.addLog('warn', message, details);
  }

  error(message: string, details?: unknown) {
    this.addLog('error', message, details);
  }

  async checkEnvironment() {
    this.info('Checking environment variables', {
      supabaseUrl: Boolean(env.VITE_SUPABASE_URL),
      supabaseAnonKey: Boolean(env.VITE_SUPABASE_ANON_KEY),
      stripeKey: Boolean(env.VITE_STRIPE_PUBLISHABLE_KEY)
    });
  }

  async checkNetwork() {
    try {
      const supabaseResponse = await fetch(env.VITE_SUPABASE_URL);
      this.info('Supabase connection check', {
        status: supabaseResponse.status,
        ok: supabaseResponse.ok
      });
    } catch (error) {
      this.error('Supabase connection failed', error);
    }
  }

  async checkBrowserCompatibility() {
    this.info('Browser Information', {
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookiesEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      platform: navigator.platform
    });
  }

  getDOMState() {
    this.info('DOM State', {
      rootElement: Boolean(document.getElementById('root')),
      bodyChildren: document.body.children.length,
      scripts: document.scripts.length,
      styleSheets: document.styleSheets.length
    });
  }

  async runDiagnostics() {
    this.info('Starting diagnostics');
    await this.checkEnvironment();
    await this.checkNetwork();
    await this.checkBrowserCompatibility();
    this.getDOMState();
    this.info('Diagnostics complete');
  }

  getFullReport(): string {
    return JSON.stringify({
      logs: this.logs,
      timestamp: this.formatTimestamp(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }, null, 2);
  }
}

export const logger = new Logger();
