import React, { useEffect } from 'react';
import { CheckCircle, X, AlertTriangle, Info, XCircle } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const { id, type, title, message, duration = 5000 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-white" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-white" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-white" />;
      case 'info':
        return <Info className="w-5 h-5 text-white" />;
      default:
        return <Info className="w-5 h-5 text-white" />;
    }
  };

  const getToastStyles = () => {
    const baseStyles = "flex items-start space-x-3 p-4 rounded-2xl shadow-xl border-2 backdrop-blur-sm transition-all duration-300 transform translate-x-0";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-blue-600 border-blue-400 text-white`;
      case 'error':
        return `${baseStyles} bg-red-600 border-red-400 text-white`;
      case 'warning':
        return `${baseStyles} bg-yellow-600 border-yellow-400 text-white`;
      case 'info':
        return `${baseStyles} bg-blue-600 border-blue-400 text-white`;
      default:
        return `${baseStyles} bg-blue-600 border-blue-400 text-white`;
    }
  };

  return (
    <div 
      className={getToastStyles()}
      style={{
        backgroundColor: '#2563eb',
        borderColor: '#60a5fa',
        color: 'white',
        borderRadius: '1rem',
        borderWidth: '2px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-sm opacity-90 mt-1">{message}</p>
      </div>
      <button
        onClick={() => onRemove(id)}
        className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors duration-200"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
