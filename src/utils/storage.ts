export const isStorageAvailable = () => {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    return true;
  } catch (e) {
    return false;
  }
};

export const getFallbackStorage = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    return sessionStorage;
  } catch {
    return null;
  }
};

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (isStorageAvailable()) {
        return localStorage.getItem(key);
      }
      const fallback = getFallbackStorage();
      return fallback?.getItem(key) || null;
    } catch (error) {
      console.error('Erro ao ler do storage:', error);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      if (isStorageAvailable()) {
        localStorage.setItem(key, value);
        return;
      }
      const fallback = getFallbackStorage();
      fallback?.setItem(key, value);
    } catch (error) {
      console.error('Erro ao salvar no storage:', error);
    }
  },

  removeItem: (key: string): void => {
    try {
      if (isStorageAvailable()) {
        localStorage.removeItem(key);
        return;
      }
      const fallback = getFallbackStorage();
      fallback?.removeItem(key);
    } catch (error) {
      console.error('Erro ao remover do storage:', error);
    }
  }
};
