import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

/** Status tone used by SLA, age and payment indicators. Meaning is never carried by colour alone. */
export type Tone = 'ok' | 'warn' | 'bad' | 'neutral';

export const toneIcon = (t: Tone): IconName => (t === 'bad' ? 'warn' : t === 'ok' ? 'check' : 'clock');

/* ───────────── Chips & tags ───────────── */

export function Chip({ tone = 'neutral', icon, children, small, square }: { tone?: Tone | 'plain'; icon?: IconName; children: ReactNode; small?: boolean; square?: boolean }) {
  const cls = tone === 'ok' ? 'chip--success' : tone === 'warn' ? 'chip--warning' : tone === 'bad' ? 'chip--danger' : tone === 'plain' ? 'chip--neutral' : '';
  return (
    <span className={`chip ${cls} ${small ? 'chip--sm' : ''} ${square ? 'chip--square' : ''}`}>
      {icon && <Icon name={icon} size={small ? 9 : 10} stroke={3} />}
      {children}
    </span>
  );
}

/** Age in stage. g = within SLA, a = past 75% of SLA, r = overdue. */
export type AgeState = 'g' | 'a' | 'r';

export function Age({ state, children, icon = true }: { state: AgeState; children: ReactNode; icon?: boolean }) {
  const cls = state === 'r' ? 'age--danger' : state === 'a' ? 'age--warning' : '';
  return (
    <span className={`age ${cls}`}>
      {icon && <Icon name={state === 'r' ? 'warn' : 'clock'} size={9} stroke={3} />}
      {children}
    </span>
  );
}

export function StageBadge({ stage, age, state = 'g' }: { stage: string; age?: string; state?: AgeState }) {
  const cls = state === 'r' ? 'stage-badge__age--danger' : state === 'a' ? 'stage-badge__age--warning' : '';
  return (
    <span className="stage-badge">
      <span className="stage-badge__name">{stage}</span>
      {age && (
        <span className={`stage-badge__age ${cls}`}>
          {state !== 'g' && <Icon name={state === 'r' ? 'warn' : 'clock'} size={10} stroke={3} />}
          {age}
        </span>
      )}
    </span>
  );
}

export const UnitTag = ({ children, small }: { children: ReactNode; small?: boolean }) => (
  <span className={`unit-tag ${small ? 'unit-tag--sm' : ''}`}>{children}</span>
);

export const SourceTag = ({ children, small }: { children: ReactNode; small?: boolean }) => (
  <span className={`source-tag ${small ? 'source-tag--sm' : ''}`}>{children}</span>
);

export function Avatar({ initials, size = 28, variant, title }: { initials: string; size?: 20 | 24 | 28 | 32 | 40 | 48; variant?: 'dark' | 'empty'; title?: string }) {
  const empty = variant === 'empty' || initials === '?';
  return (
    <span title={title} className={`avatar ${size !== 28 ? `avatar--${size}` : ''} ${empty ? 'avatar--empty' : variant === 'dark' ? 'avatar--dark' : ''}`}>
      {initials}
    </span>
  );
}

export function Track({ pct, color, h = 6, label }: { pct: number | string; color?: string; h?: 4 | 6 | 8 | 10 | 12; label?: string }) {
  const width = typeof pct === 'number' ? `${pct}%` : pct;
  return (
    <span className={`track ${h !== 6 ? `track--${h}` : ''}`} role={label ? 'img' : undefined} aria-label={label}>
      <span style={{ width, background: color }} />
    </span>
  );
}

/* ───────────── Buttons ───────────── */

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: IconName;
  block?: boolean;
};

export function Button({ variant = 'secondary', size = 'md', icon, block, className = '', children, type = 'button', ...rest }: BtnProps) {
  const sz = size === 'md' ? '' : `btn--${size}`;
  return (
    <button type={type} className={`btn btn--${variant} ${sz} ${block ? 'btn--block' : ''} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  );
}

/**
 * A disabled action that stays visible, with a tooltip naming why and who can do it.
 * e.g. "Only Sales Managers can reassign leads".
 */
export function DisabledWhy({ reason, children, lock = true, size = 'md', variant = 'secondary', fill }: { reason: string; children: ReactNode; lock?: boolean; size?: BtnProps['size']; variant?: BtnProps['variant']; fill?: boolean }) {
  const id = useId();
  return (
    <span className="why" style={fill ? { flex: 1 } : undefined}>
      <button type="button" disabled aria-describedby={id} className={`btn btn--${variant} ${size === 'md' ? '' : `btn--${size}`}`} style={fill ? { flex: 1 } : undefined}>
        {lock && <Icon name="lock" size={12} stroke={2.5} />}
        {children}
      </button>
      <span role="tooltip" id={id} className="why__tip">
        {reason}
      </span>
    </span>
  );
}

/* ───────────── Panels ───────────── */

export function Panel({ title, titleId, meta, actions, children, clip = true, pad, className = '', baseline }: { title?: ReactNode; titleId?: string; meta?: ReactNode; actions?: ReactNode; children?: ReactNode; clip?: boolean; pad?: boolean; className?: string; baseline?: boolean }) {
  const autoId = useId();
  const hid = titleId ?? autoId;
  return (
    <section aria-labelledby={title ? hid : undefined} className={`panel ${clip ? 'panel--clip' : ''} ${pad ? 'panel--pad' : ''} ${className}`}>
      {title && (
        <div className={`panel__head ${baseline ? 'panel__head--baseline' : ''}`}>
          <h2 id={hid} className="panel__title">
            {title}
          </h2>
          {meta}
          {actions && (
            <>
              <span className="spacer" />
              {actions}
            </>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

/* ───────────── Filters ───────────── */

export function FilterChip({ label, value, on, onRemove }: { label: string; value?: ReactNode; on?: boolean; onRemove?: () => void }) {
  return (
    <span className={`filter-chip ${on ? 'filter-chip--on' : ''}`}>
      {label}
      {value !== undefined && <>: <b>{value}</b></>}
      {onRemove && (
        <button type="button" className="filter-chip__x" aria-label={`Remove ${label.toLowerCase()} filter`} onClick={onRemove}>
          ×
        </button>
      )}
    </span>
  );
}

/* ───────────── Pagination ───────────── */

export function Pagination({ summary, page, pages, onPage }: { summary: ReactNode; page: number; pages: number; onPage: (p: number) => void }) {
  const shown = Array.from(new Set([1, 2, 3, page, pages])).filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
  return (
    <nav className="pagination" aria-label="Pagination">
      <span>{summary}</span>
      <div className="pagination__pages">
        <button type="button" className="pagination__step" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          ‹
        </button>
        {shown.map((p, i) => (
          <span key={p} style={{ display: 'contents' }}>
            {i > 0 && p - shown[i - 1] > 1 && <span style={{ padding: '0 4px' }}>…</span>}
            <button type="button" className="pagination__btn" aria-current={p === page ? 'page' : undefined} onClick={() => onPage(p)}>
              {p}
            </button>
          </span>
        ))}
        <button type="button" className="pagination__step" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          ›
        </button>
      </div>
    </nav>
  );
}

/* ───────────── Overlays ───────────── */

function useEscape(onClose: () => void) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
}

function useAutoFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current?.querySelector<HTMLElement>('input, button, select, textarea, [tabindex]');
    el?.focus();
  }, []);
  return ref;
}

export function Modal({ title, sub, onClose, children, actions, width = 440 }: { title: ReactNode; sub?: ReactNode; onClose: () => void; children: ReactNode; actions: ReactNode; width?: number }) {
  useEscape(onClose);
  const ref = useAutoFocus<HTMLDivElement>();
  const id = useId();
  return (
    <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={id} className="modal" style={{ maxWidth: width }}>
        <div className="row" style={{ alignItems: 'flex-start' }}>
          <div className="spacer">
            <div id={id} className="modal__title">
              {title}
            </div>
            {sub && <div className="small muted">{sub}</div>}
          </div>
          <button type="button" className="close-x" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        {children}
        <div className="modal__actions">{actions}</div>
      </div>
    </div>
  );
}

export function Drawer({ title, sub, onClose, children, footer, wide }: { title: ReactNode; sub?: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  useEscape(onClose);
  const id = useId();
  return (
    <div className="scrim scrim--right" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside role="dialog" aria-modal="true" aria-labelledby={id} className={`drawer ${wide ? 'drawer--wide' : ''}`}>
        <div className="drawer__head">
          <div className="spacer">
            <div id={id} className="t-h2">
              {title}
            </div>
            {sub && <div className="small muted">{sub}</div>}
          </div>
          <button type="button" className="close-x" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="drawer__body">{children}</div>
        {footer && <div className="drawer__foot">{footer}</div>}
      </aside>
    </div>
  );
}

export function Sheet({ label, onClose, children }: { label: string; onClose: () => void; children: ReactNode }) {
  useEscape(onClose);
  return (
    <div className="scrim scrim--bottom" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={label} className="sheet">
        <span className="sheet__grip" />
        {children}
      </div>
    </div>
  );
}

/* ───────────── Skeleton ───────────── */

export const Skel = ({ w, h = 10 }: { w: string | number; h?: number }) => <span className="skel" style={{ width: w, height: h }} />;

/* ───────────── Tone helpers ───────────── */

export const toneFg = (t: Tone) => (t === 'bad' ? 'var(--danger)' : t === 'warn' ? 'var(--warning)' : t === 'ok' ? 'var(--success)' : 'var(--text-2)');
export const toneBar = (t: Tone) => (t === 'bad' ? 'var(--danger)' : t === 'warn' ? 'var(--warning-bar)' : 'var(--brand-600)');
