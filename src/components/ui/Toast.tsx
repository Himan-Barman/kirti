import React, { useEffect, useState } from 'react';
import { useStore } from '../../lib/store';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import './Toast.css';

export interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastItemProps {
  toast: ToastData;
  onRemove: (id: string) => void;
}

const ICONS = {
  success: <CheckCircle2 size={18} className="toast-icon success" />,
  error: <AlertCircle size={18} className="toast-icon error" />,
  warning: <AlertTriangle size={18} className="toast-icon warning" />,
  info: <Info size={18} className="toast-icon info" />
};

const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Start leaving animation slightly before actual removal
    const leaveTimer = setTimeout(() => {
      setIsLeaving(true);
    }, 2700);

    const removeTimer = setTimeout(() => {
      onRemove(toast.id);
    }, 3000);

    return () => {
      clearTimeout(leaveTimer);
      clearTimeout(removeTimer);
    };
  }, [toast.id, onRemove]);

  return (
    <div className={`kirti-toast ${toast.type} ${isLeaving ? 'leaving' : 'entering'}`}>
      <div className="toast-content-wrapper">
        <div className="toast-icon-wrap">
          {ICONS[toast.type]}
        </div>
        <div className="toast-message">
          {toast.message}
        </div>
        <button className="toast-close-btn" onClick={() => { setIsLeaving(true); setTimeout(() => onRemove(toast.id), 300); }}>
          <X size={14} />
        </button>
      </div>
      <div className="toast-progress-track">
        <div className="toast-progress-bar" />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="kirti-toast-container">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};
