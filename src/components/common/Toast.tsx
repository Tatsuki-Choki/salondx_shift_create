import React, { useEffect } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { ToastMessage, ToastType } from '@/types';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <Check className="w-5 h-5" />,
    error: <X className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />
  };

  const colors: Record<ToastType, string> = {
    success: 'bg-white text-green-800 border-green-300',
    error: 'bg-white text-red-800 border-red-300',
    warning: 'bg-white text-yellow-800 border-yellow-300'
  };

  const iconColors: Record<ToastType, string> = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600'
  };

  return (
    <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-in border-2 ${colors[toast.type]}`}>
      <div className={iconColors[toast.type]}>
        {icons[toast.type]}
      </div>
      <span className="font-medium">{toast.message}</span>
      <button 
        onClick={() => onClose(toast.id)} 
        className="ml-2 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;