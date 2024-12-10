type ErrorLogLevel = 'error' | 'warn' | 'info';

class ErrorLogger {
  private logToConsole(level: ErrorLogLevel, error: Error | unknown, context?: string) {
    const timestamp = new Date().toISOString();
    const contextInfo = context ? ` [${context}]` : '';
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console[level](`[${timestamp}]${contextInfo} ${errorMessage}`);
    if (errorStack) {
      console[level]('Stack trace:', errorStack);
    }

    // Aqui você pode adicionar integração com serviços de monitoramento
    // como Sentry, LogRocket, etc.
  }

  error(error: Error | unknown, context?: string) {
    this.logToConsole('error', error, context);
  }

  warn(error: Error | unknown, context?: string) {
    this.logToConsole('warn', error, context);
  }

  info(message: string, context?: string) {
    const timestamp = new Date().toISOString();
    const contextInfo = context ? ` [${context}]` : '';
    console.info(`[${timestamp}]${contextInfo} ${message}`);
  }
}

export const errorLogger = new ErrorLogger();
