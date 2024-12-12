const errorLogger = {
  logError: (error: Error, context: string) => {
    console.error(`[${context}] Error:`, error);
    // Aqui você pode adicionar lógica adicional de logging, como enviar para um serviço de monitoramento
  }
};

export default errorLogger;
