import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContainer = ({ toasts, onClose }) => {
  if (!toasts || toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="toast-icon text-emerald-400" size={18} color="#10b981" />;
      case 'error':
        return <AlertCircle className="toast-icon text-rose-400" size={18} color="#f43f5e" />;
      case 'warning':
        return <AlertTriangle className="toast-icon text-amber-400" size={18} color="#f59e0b" />;
      default:
        return <Info className="toast-icon text-indigo-400" size={18} color="#6366f1" />;
    }
  };

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`} role="alert">
          <div style={{ flexShrink: 0, marginTop: '2px' }}>{getIcon(toast.type)}</div>
          <div style={{ flex: 1, fontSize: '0.875rem', color: '#f8fafc', lineHeight: 1.4 }}>
            {toast.message}
          </div>
          <button
            onClick={() => onClose(toast.id)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
