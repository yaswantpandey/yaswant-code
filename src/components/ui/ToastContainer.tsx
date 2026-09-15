import React from 'react';
import { useLms } from '../../context/LmsContext';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useLms();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl bg-neutral-900/95 text-white dark:bg-neutral-950/95 border border-neutral-800 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white">{toast.title}</div>
            {toast.message && (
              <div className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                {toast.message}
              </div>
            )}
          </div>

          <button
            onClick={() => removeToast(toast.id)}
            className="text-neutral-500 hover:text-white p-0.5 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
