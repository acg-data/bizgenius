import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Toast configuration
const TOAST_ICONS: Record<ToastType, typeof CheckCircleIcon> = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  warning: ExclamationTriangleIcon,
  info: InformationCircleIcon,
};

const TOAST_STYLES: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: 'bg-success-50',
    icon: 'text-success-500',
    border: 'border-success-200',
  },
  error: {
    bg: 'bg-danger-50',
    icon: 'text-danger-500',
    border: 'border-danger-200',
  },
  warning: {
    bg: 'bg-warning-50',
    icon: 'text-warning-500',
    border: 'border-warning-200',
  },
  info: {
    bg: 'bg-primary-50',
    icon: 'text-primary-500',
    border: 'border-primary-200',
  },
};

const DEFAULT_DURATION = 5000; // 5 seconds

// Individual Toast Component
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const Icon = TOAST_ICONS[toast.type];
  const styles = TOAST_STYLES[toast.type];

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        ${styles.bg} ${styles.border}
        animate-slide-in-right
        max-w-md w-full
      `}
      role="alert"
    >
      <Icon className={`w-5 h-5 ${styles.icon} flex-shrink-0 mt-0.5`} />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{toast.title}</p>
        {toast.message && (
          <p className="mt-1 text-sm text-gray-600">{toast.message}</p>
        )}
      </div>

      <button
        onClick={onRemove}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

// Toast Container Component
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-2"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => onRemove(toast.id)}
        />
      ))}
    </div>,
    document.body
  );
}

// Toast Provider Component
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = toast.duration ?? DEFAULT_DURATION;

    setToasts((prev) => [...prev, { ...toast, id }]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((title: string, message?: string) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string) => {
    addToast({ type: 'error', title, message, duration: 8000 }); // Longer duration for errors
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Hook to use toast
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
