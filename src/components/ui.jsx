import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertCircle, Check, Loader2, X, Inbox } from 'lucide-react';
import { initials } from '../lib/format.js';

export const cx = (...a) => a.filter(Boolean).join(' ');

/* ---------- Button ---------- */
const BTN = {
  primary: 'btn-primary bg-peacock-600 text-white hover:bg-peacock-700 disabled:bg-peacock-600/50',
  secondary: 'btn-secondary bg-white text-ink border border-line hover:bg-paper hover:border-peacock-200 disabled:text-mute',
  ghost: 'text-ink-600 hover:bg-ink/5',
  danger: 'btn-danger bg-lotus-600 text-white hover:bg-lotus-700 disabled:bg-lotus-600/50',
  success: 'btn-success bg-moss-600 text-white hover:bg-moss-700 disabled:bg-moss-600/50',
  dangerSoft: 'bg-lotus-50 text-lotus-700 hover:bg-lotus-100',
};
export function Button({ variant = 'primary', size = 'md', loading, icon: Icon, className, children, disabled, ...p }) {
  const sz = size === 'sm' ? 'px-3 py-1.5 text-[13px]' : size === 'lg' ? 'px-6 py-3 text-[15px]' : 'px-4 py-2 text-[14px]';
  return (
    <button disabled={disabled || loading} className={cx('inline-flex items-center justify-center gap-2 rounded-ctl font-semibold transition-colors disabled:cursor-not-allowed', sz, BTN[variant], className)} {...p}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : Icon && <Icon className="h-4 w-4" aria-hidden />}
      {children}
    </button>
  );
}

/* ---------- Surfaces ---------- */
export const Card = ({ className, children, ...p }) => <section className={cx('nx-card rounded-card border border-line bg-white', className)} {...p}>{children}</section>;
export const CardHeader = ({ title, action, sub }) => (
  <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
    <div><h2 className="text-[15px] font-bold leading-tight">{title}</h2>{sub && <p className="mt-0.5 text-[13px] text-mute">{sub}</p>}</div>
    {action}
  </div>
);

const TONES = {
  neutral: 'bg-ink/5 text-ink-600', teal: 'bg-peacock-50 text-peacock-700', saffron: 'bg-saffron-50 text-saffron-700',
  lotus: 'bg-lotus-50 text-lotus-700', moss: 'bg-moss-50 text-moss-700',
};
export const Badge = ({ tone = 'neutral', dot = false, children }) => (
  <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold whitespace-nowrap', TONES[tone])}>
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}{children}
  </span>
);
export const StatusBadge = ({ map, value }) => { const s = map[value] || { label: value, tone: 'neutral' }; return <Badge tone={s.tone}>{s.label}</Badge>; };

const AV = ['#6c5ce7', '#00b8d9', '#12b76a', '#f79009', '#e84393', '#0984e3', '#e17055', '#00a884'];
export function Avatar({ name = '', size = 36 }) {
  const i = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AV.length;
  return <span style={{ width: size, height: size, fontSize: size * 0.36, background: AV[i] }} className="inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white" aria-hidden>{initials(name)}</span>;
}

export const Spinner = ({ label = 'Loading' }) => (
  <div className="flex items-center justify-center gap-2 py-14 text-mute" role="status"><Loader2 className="h-5 w-5 animate-spin" aria-hidden /><span className="text-[14px]">{label}</span></div>
);
export const Empty = ({ title, hint, action, icon: Icon = Inbox }) => (
  <div className="flex flex-col items-center px-6 py-12 text-center">
    <span className="mb-3 rounded-full bg-peacock-50 p-3 text-peacock-600"><Icon className="h-6 w-6" aria-hidden /></span>
    <p className="font-display text-[17px] font-semibold">{title}</p>
    {hint && <p className="mt-1 max-w-sm text-[14px] text-mute">{hint}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
export const ErrorNote = ({ error, retry }) => (
  <div className="m-4 flex items-start gap-3 rounded-ctl border border-lotus-100 bg-lotus-50 p-4 text-[14px] text-lotus-700" role="alert">
    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
    <div className="flex-1">{error?.message || 'Something went wrong.'}</div>
    {retry && <button onClick={retry} className="font-semibold underline">Try again</button>}
  </div>
);

export const PageHeader = ({ title, sub, actions }) => (
  <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
    <div><h1 className="text-[24px] font-bold leading-tight">{title}</h1>{sub && <p className="mt-1 text-[14px] text-mute">{sub}</p>}</div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </header>
);

export function Tabs({ tabs, value, onChange }) {
  return (
    <div role="tablist" className="inline-flex rounded-ctl bg-ink/5 p-1">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={cx('rounded-lg px-3.5 py-1.5 text-[13.5px] font-semibold transition-colors', value === t.id ? 'bg-white text-peacock-700 shadow-sm' : 'text-mute hover:text-ink')}>
          {t.label}{t.count != null && <span className="ml-1.5 rounded-full bg-peacock-600 px-1.5 text-[11px] text-white">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- Form ---------- */
export const Field = ({ label, hint, error, children, className }) => (
  <label className={cx('block', className)}>
    <span className="mb-1.5 block text-[13.5px] font-semibold text-ink-700">{label}</span>
    {children}
    {hint && !error && <span className="mt-1 block text-[12.5px] text-mute">{hint}</span>}
    {error && <span className="mt-1 block text-[12.5px] font-medium text-lotus-600">{error}</span>}
  </label>
);
export const Input = (p) => <input className="input" {...p} />;
export const Select = ({ children, ...p }) => <select className="input" {...p}>{children}</select>;
export const Textarea = (p) => <textarea rows={3} className="input resize-none" {...p} />;

/* ---------- Modal / drawer ---------- */
export function Modal({ open, onClose, title, sub, children, footer, size = 'md', side = false }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => { document.removeEventListener('keydown', onKey); prev?.focus?.(); };
  }, [open, onClose]);
  if (!open) return null;
  const w = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' }[size];
  return (
    <div className={cx('fixed inset-0 z-50 flex bg-black/50 p-4', side ? 'justify-end' : 'items-center justify-center')} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className={cx('flex max-h-full w-full flex-col bg-white shadow-pop focus:outline-none', side ? 'max-w-md rounded-sheet' : cx(w, 'rounded-sheet'), 'rise')}>
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div><h2 className="text-[20px] font-semibold leading-tight">{title}</h2>{sub && <p className="mt-0.5 text-[13.5px] text-mute">{sub}</p>}</div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-mute hover:bg-ink/5"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line bg-paper/50 px-6 py-3.5">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Toasts ---------- */
const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((kind, text) => {
    const id = Math.random();
    setItems((s) => [...s, { id, kind, text }]);
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 4500);
  }, []);
  const api = useRef({ success: (t) => push('ok', t), error: (t) => push('err', t) }).current;
  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex flex-col gap-2" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={cx('pointer-events-auto rise flex max-w-sm items-start gap-2.5 rounded-ctl px-4 py-3 text-[14px] font-medium text-white shadow-pop', t.kind === 'ok' ? 'bg-[#161a2e]' : 'bg-lotus-600')}>
            {t.kind === 'ok' ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-moss-100" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}{t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- Small data bits ---------- */
export const Stat = ({ label, value, sub, tone, hero }) => (
  <div className={cx('nx-card rounded-card border border-line bg-white p-[18px]', hero && 'nx-kpi-hero')}>
    <p className="text-[12px] font-medium uppercase tracking-wide text-mute">{label}</p>
    <p className={cx('mt-1 text-[28px] font-bold leading-tight tabular-nums', tone === 'saffron' && 'text-saffron-600', tone === 'lotus' && 'text-lotus-600', tone === 'moss' && 'text-moss-600')}>{value}</p>
    {sub && <p className="mt-0.5 text-[12.5px] text-mute">{sub}</p>}
  </div>
);
export const Definition = ({ label, children }) => (
  <div className="flex items-baseline justify-between gap-4 border-b border-line/70 py-2.5 last:border-0">
    <dt className="text-[13.5px] text-mute">{label}</dt><dd className="text-right text-[14px] font-medium">{children || '–'}</dd>
  </div>
);
