import { useAppContext } from '@/context/AppContext';
import { ToastType } from '@/types';

/**
 * Custom hook for managing toast notifications
 */
export const useToast = () => {
  const { state, showToast, removeToast } = useAppContext();

  return {
    toasts: state.toasts,
    showToast: (message: string, type: ToastType = 'success') => {
      showToast(message, type);
    },
    showSuccess: (message: string) => {
      showToast(message, 'success');
    },
    showError: (message: string) => {
      showToast(message, 'error');
    },
    showWarning: (message: string) => {
      showToast(message, 'warning');
    },
    removeToast
  };
};

export default useToast;