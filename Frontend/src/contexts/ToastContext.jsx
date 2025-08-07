import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const toast = (message, options = {}) => {
    return addToast(message, 'info', options.duration);
  };

  toast.success = (message, options = {}) => {
    return addToast(message, 'success', options.duration || 3000);
  };

  toast.error = (message, options = {}) => {
    return addToast(message, 'error', options.duration || 5000);
  };

  toast.warning = (message, options = {}) => {
    return addToast(message, 'warning', options.duration || 4000);
  };

  const value = {
    toast,
    toasts,
    removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

// Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white border-green-600';
      case 'error':
        return 'bg-red-500 text-white border-red-600';
      case 'warning':
        return 'bg-yellow-500 text-black border-yellow-600';
      default:
        return 'bg-blue-500 text-white border-blue-600';
    }
  };

  return (
    <div className={`
      px-6 py-3 rounded-lg shadow-lg border-l-4 max-w-sm
      animate-in slide-in-from-right duration-300
      ${getToastStyles(toast.type)}
    `}>
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">{toast.message}</p>
        <button
          onClick={() => onRemove(toast.id)}
          className="ml-4 text-lg hover:opacity-70 transition-opacity"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default ToastContext;
