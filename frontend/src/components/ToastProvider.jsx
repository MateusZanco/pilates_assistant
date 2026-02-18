import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const toneClasses = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800/40 dark:bg-emerald-950/70 dark:text-emerald-200',
  error: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800/40 dark:bg-rose-950/70 dark:text-rose-200',
  info: 'border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
};

const toneIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

function normalizeToastMessage(message) {
  if (typeof message === 'string') {
    return message;
  }
  if (Array.isArray(message)) {
    return message
      .map((item) => {
        if (typeof item === 'string') {
          return item;
        }
        if (item && typeof item === 'object' && typeof item.msg === 'string') {
          return item.msg;
        }
        return String(item);
      })
      .join(' | ');
  }
  if (message && typeof message === 'object') {
    if (typeof message.detail === 'string') {
      return message.detail;
    }
    if (Array.isArray(message.detail)) {
      return normalizeToastMessage(message.detail);
    }
    return JSON.stringify(message);
  }
  return String(message ?? '');
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ type = 'info', message }) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, message: normalizeToastMessage(message) }]);
      window.setTimeout(() => removeToast(id), 3200);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ pushToast }), [pushToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = toneIcons[toast.type] || toneIcons.info;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-2 rounded-xl border px-3 py-2 text-sm shadow-card ${toneClasses[toast.type] || toneClasses.info}`}
            >
              <Icon size={16} className="mt-0.5" />
              <p className="flex-1">{toast.message}</p>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded p-0.5 opacity-70 transition hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
