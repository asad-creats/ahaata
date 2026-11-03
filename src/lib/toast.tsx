import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../components/Icon';

type ToastInput = { text: ReactNode; action?: { label: string; onClick: () => void }; tone?: 'info' | 'alert' };
type ToastItem = ToastInput & { id: number };

const Ctx = createContext<(t: ToastInput) => void>(() => {});

/** Toasts sit bottom-left, last 6s and pause while hovered. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const push = useCallback((t: ToastInput) => {
    seq.current += 1;
    const id = seq.current;
    setItems((xs) => [...xs.slice(-2), { ...t, id }]);
  }, []);
  const remove = useCallback((id: number) => setItems((xs) => xs.filter((x) => x.id !== id)), []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="toast-region" aria-live="polite">
        {items.map((t) => (
          <Toast key={t.id} item={t} onDone={() => remove(t.id)} />
        ))}
      </div>
    </Ctx.Provider>
  );
}

function Toast({ item, onDone }: { item: ToastItem; onDone: () => void }) {
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(onDone, 6000);
    return () => window.clearTimeout(t);
  }, [paused, onDone]);
  const alert = item.tone === 'alert';
  return (
    <div role={alert ? 'alert' : 'status'} className={`toast ${alert ? 'toast--alert' : ''}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <Icon name={alert ? 'info' : 'check'} color={alert ? 'var(--danger)' : '#5CC98A'} stroke={2.5} />
      <span className="spacer">{item.text}</span>
      {item.action && (
        <button
          type="button"
          className={alert ? 'btn btn--primary btn--sm' : 'toast__action'}
          onClick={() => {
            item.action?.onClick();
            onDone();
          }}
        >
          {item.action.label}
        </button>
      )}
    </div>
  );
}

export const useToast = () => useContext(Ctx);
