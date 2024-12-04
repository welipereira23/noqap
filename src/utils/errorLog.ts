import { format } from 'date-fns';

interface ErrorLog {
  timestamp: Date;
  type: string;
  message: string;
  stack?: string;
  fixed?: boolean;
  solution?: string;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: ErrorLog[] = [];
  
  private constructor() {}
  
  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  logError(error: Error, type: string) {
    const log: ErrorLog = {
      timestamp: new Date(),
      type,
      message: error.message,
      stack: error.stack,
      fixed: false
    };
    
    this.logs.push(log);
    console.error(`[${format(log.timestamp, 'dd/MM/yyyy HH:mm:ss')}] ${type}: ${error.message}`);
  }

  markAsFixed(index: number, solution: string) {
    if (this.logs[index]) {
      this.logs[index].fixed = true;
      this.logs[index].solution = solution;
    }
  }

  getErrors(): ErrorLog[] {
    return this.logs;
  }

  getPendingErrors(): ErrorLog[] {
    return this.logs.filter(log => !log.fixed);
  }

  clear() {
    this.logs = [];
  }
}

export const errorLogger = ErrorLogger.getInstance();