
import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, duration = 5000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`pointer-events-auto min-w-[300px] max-w-md p-4 rounded-xl shadow-xl border flex items-start gap-3 animate-in slide-in-from-right-full duration-300 ${
              toast.type === 'success' ? 'bg-white border-green-200 text-slate-800' :
              toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
              toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
              'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className={`mt-0.5 ${
               toast.type === 'success' ? 'text-green-500' :
               toast.type === 'error' ? 'text-red-500' :
               toast.type === 'warning' ? 'text-amber-500' :
               'text-blue-500'
            }`}>
               {toast.type === 'success' && '✓'}
               {toast.type === 'error' && '✕'}
               {toast.type === 'warning' && '⚠'}
               {toast.type === 'info' && 'ℹ'}
            </div>
            <p className="text-sm font-medium flex-grow">{toast.message}</p>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
