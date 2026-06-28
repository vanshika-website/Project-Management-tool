import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';
interface Toast { id: number; type: ToastType; message: string; }

const ToastCtx = createContext<(type: ToastType, message: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  const remove = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  const icon = { success: CheckCircle2, error: AlertCircle, info: Info };
  const tone = {
    success: 'text-emerald-600',
    error: 'text-rose-600',
    info: 'text-brand-600',
  };

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-[min(92vw,360px)]">
        {toasts.map((t) => {
          const Icon = icon[t.type];
          return (
            <div key={t.id} className="card flex items-start gap-3 p-3.5 animate-slide-in shadow-lift">
              <Icon size={18} className={`mt-0.5 shrink-0 ${tone[t.type]}`} />
              <p className="text-sm text-ink-800 flex-1 leading-snug">{t.message}</p>
              <button onClick={() => remove(t.id)} className="text-ink-400 hover:text-ink-700 -mr-0.5">
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}
