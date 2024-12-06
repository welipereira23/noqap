import { toast as hotToast } from 'sonner';

export const toast = {
  success: (message: string) => {
    hotToast.success(message);
  },
  error: (message: string) => {
    hotToast.error(message);
  },
  info: (message: string) => {
    hotToast.info(message);
  },
  warning: (message: string) => {
    hotToast.warning(message);
  }
};
