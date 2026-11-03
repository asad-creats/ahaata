import { useEffect, useState, type ReactNode } from 'react';
import { usePopover } from '../lib/hooks';
import { useSession } from '../lib/session';
import { Icon } from './Icon';

type Filters = { agent: string; source: string; range: string };
const KEY = 'ehata.insightFilters.v1';
const DEFAULTS: Filters = { agent: 'All (9)', source: 'All', range: 'Last 30 days' };

const OPTIONS: Record<keyof Filters, string[]> = {
  agent: ['All (9)', 'Usman Tariq', 'Maryam Baig', 'Fahad Nadeem', 'Sana Naveed', 'Kashif Abbasi'],
  source: ['All', 'Facebook', 'Zameen', 'Graana', 'Expo', 'Dealers', 'Walk-in / Website'],
  range: ['Today', 'Last 7 days', 'Last 30 days', 'This quarter'],
};

const RANGE_LABEL: Record<string, string> = {
  Today: '3 Nov 2026',
  'Last 7 days': '27 Oct – 2 Nov 2026',
  'Last 30 days': '4 Oct – 2 Nov 2026',
  'This quarter': '1 Oct – 2 Nov 2026',
};

function read(): Filters {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Filters>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

/** One filter bar per insight screen; filters persist across the four insight screens. */
export function useInsightFilters() {
  const [f, setF] = useState<Filters>(read);
  useEffect(() => {
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify(f));
    } catch {
      /* ignore */
    }
  }, [f]);
  return [f, (p: Partial<Filters>) => setF((x) => ({ ...x, ...p }))] as const;
}

function Pick({ label, value, options, onPick, icon }: { label?: string; value: string; options: string[]; onPick: (v: string) => void; icon?: boolean }) {
  const pop = usePopover();
  return (
    <div style={{ position: 'relative' }} ref={pop.ref}>
      <button type="button" className="filter-chip" aria-expanded={pop.open} onClick={pop.toggle}>
        {icon && <Icon name="calendar" size={14} color="var(--text-muted)" />}
        {label && <>{label}: </>}
        <b>{icon ? RANGE_LABEL[value] : value}</b>
        {icon && <span className="small muted">vs prev. {value === 'Today' ? 'day' : value.replace('Last ', '').replace('This ', '')}</span>}
      </button>
      {pop.open && (
        <div role="menu" className="menu" style={{ top: 38, left: 0 }}>
          {options.map((o) => (
            <button
              key={o}
              type="button"
              role="menuitemradio"
              aria-checked={o === value}
              className="menu__item"
              onClick={() => {
                onPick(o);
                pop.setOpen(false);
              }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function InsightFilterBar({ showRange = true, extra }: { showRange?: boolean; extra?: ReactNode }) {
  const s = useSession();
  const [f, set] = useInsightFilters();
  return (
    <>
      <Pick label="Project" value={s.project} options={s.org.projects} onPick={s.setProject} />
      <Pick label="Agent" value={f.agent} options={OPTIONS.agent} onPick={(agent) => set({ agent })} />
      <Pick label="Source" value={f.source} options={OPTIONS.source} onPick={(source) => set({ source })} />
      {extra}
      {showRange && <Pick value={f.range} options={OPTIONS.range} onPick={(range) => set({ range })} icon />}
    </>
  );
}
