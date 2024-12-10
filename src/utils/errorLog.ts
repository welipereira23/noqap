import { format } from 'date-fns';
import { toast } from './toast';

interface LogData {
  type: 'error' | 'warn' | 'info';
  message: string;
  details?: unknown;
  timestamp: string;
  context?: string;
}

class ErrorLogger {
  private logs: LogData[] = [];
  private readonly MAX_LOGS = 100;

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private addLog(type: LogData['type'], message: string, details?: unknown, context?: string) {
    const log: LogData = {
      type,
      message,
      details,
      context,
      timestamp: this.formatTimestamp()
    };

    this.logs.unshift(log);
    
    // Manter apenas os últimos MAX_LOGS registros
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    // Log no console com contexto
    const contextStr = context ? `[${context}] ` : '';
    console[type](`${contextStr}${message}`, details);
  }

  logError(error: Error | unknown, context?: string) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? {
      name: error.name,
      stack: error.stack,
      cause: error.cause
    } : error;

    this.addLog('error', errorMessage, errorDetails, context);
  }

  warn(message: string, details?: unknown, context?: string) {
    this.addLog('warn', message, details, context);
  }

  info(message: string, details?: unknown, context?: string) {
    this.addLog('info', message, details, context);
  }

  getLogs(): LogData[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const errorLogger = new ErrorLogger();