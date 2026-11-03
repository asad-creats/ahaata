import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { InsightFilterBar } from '../components/InsightFilters';
import { useToast } from '../lib/toast';

const SCALE = ['var(--seq-0)', 'var(--seq-1)', 'var(--seq-2)', 'var(--seq-3)', 'var(--seq-4)', 'var(--seq-5)'];
const TYPES = [
  { n: 'Studio', s: '520 sq ft' },
  { n: '1-bed', s: '780 sq ft' },
  { n: '2-bed', s: '1,150 sq ft' },
  { n: '3-bed', s: '1,620 sq ft' },
];

type Mode = 'views' | 'bookings' | 'conv';

function buildRows() {
  const rows: { f: number; cells: { v: number; b: number; flag: boolean }[] }[] = [];
  for (let f = 14; f >= 1; f--) {
    const cells = [0, 1, 2, 3].map((t) => {
      const v = Math.round(18 + t * 22 + (f >= 9 && f <= 12 ? 70 : 0) * (t === 2 ? 1.6 : 0.6) + ((f * 13 + t * 7) % 23));
      let b = Math.max(0, Math.round((t + 1) * 0.6 + (f <= 4 ? 1 : 0) - (f >= 9 && f <= 12 && t === 2 ? 3 : 0) + ((f + t) % 3) - 1));
      if (t === 0) b = Math.min(b, 1);
      return { v, b, flag: v >= 120 && b === 0 };
    });
    rows.push({ f, cells });
  }
  return rows;
}
const ROWS = buildRows();

const INSIGHTS = [
  { t: '2-bed, floors 9–12: high views, almost no bookings', d: '640 views and 1 booking since price list v7 raised these floors to 16,550/sq ft. Lost reason for 14 leads: “Price above budget”.', a: 'Draft price test in v8', to: '/inventory#price-list' },
  { t: 'Studios get attention only from overseas leads', d: '71% of studio views are from UAE/UK numbers; 3 of 4 studio bookings came from Maryam Baig.', a: 'Route studio leads to Maryam', to: '' },
  { t: 'Low floors 3-bed sell without promotion', d: 'Floors 1–4 3-bed: 8 of 8 booked or held. Consider releasing Tower C 3-bed low floors.', a: 'Open Tower C inventory', to: '/inventory' },
];

export function Heatmap() {
  const toast = useToast();
  const [mode, setMode] = useState<Mode>('views');

  const level = (v: number, b: number) => {
    if (mode === 'bookings') return Math.min(5, b * 2);
    if (mode === 'conv') return Math.min(5, Math.round((b / Math.max(v, 1)) * 100));
    return Math.min(5, Math.floor(v / 40));
  };

  return (
    <>
      <div className="row-wrap">
        <h1 className="t-h1" style={{ marginRight: 8 }}>
          Unit demand
        </h1>
        <span className="muted">Tower B · 90 days · views = public site + agent quotes</span>
        <span className="spacer" />
        <div role="group" aria-label="Colour by" className="seg">
          {(
            [
              ['views', 'Views'],
              ['bookings', 'Bookings'],
              ['conv', 'View → booking'],
            ] as [Mode, string][]
          ).map(([k, l]) => (
            <button key={k} type="button" aria-pressed={mode === k} onClick={() => setMode(k)}>
              {l}
            </button>
          ))}
        </div>
        <span className="filter-chip">
          Tower: <b>B</b>
        </span>
        <InsightFilterBar showRange={false} />
      </div>

      <div className="split">
        <section aria-labelledby="h-hm" className="panel stack-3" style={{ flex: '999 1 640px', minWidth: 0, padding: 16, overflowX: 'auto' }}>
          <h2 id="h-hm" className="panel__title">
            Floor × unit type
          </h2>
          <div role="table" aria-label="Views and bookings by floor and unit type" className="heat">
            <div role="row" style={{ display: 'contents' }}>
              <span role="columnheader" />
              {TYPES.map((t) => (
                <span key={t.n} role="columnheader" className="heat__col">
                  <span>{t.n}</span>
                  <span className="muted" style={{ fontWeight: 400 }}>
                    {t.s}
                  </span>
                </span>
              ))}
            </div>
            {ROWS.map((r) => (
              <div key={r.f} role="row" style={{ display: 'contents' }}>
                <span role="rowheader" className="heat__floor">
                  F{r.f}
                </span>
                {r.cells.map((c, t) => {
                  const lvl = level(c.v, c.b);
                  return (
                    <Link
                      key={t}
                      role="cell"
                      to="/leads"
                      className={`heat__cell ${c.flag ? 'is-flag' : ''}`}
                      aria-label={`Floor ${r.f}, ${TYPES[t].n}: ${c.v} views, ${c.b} booked${c.flag ? ', high interest low conversion' : ''}`}
                      style={{ background: SCALE[lvl], color: lvl >= 3 ? '#fff' : 'var(--text)' }}
                    >
                      <b style={{ minWidth: 30 }}>{c.v}</b>
                      <span style={{ opacity: 0.9 }}>views ·</span>
                      <b>{c.b}</b>
                      <span style={{ opacity: 0.9 }}>booked</span>
                      {c.flag && <Icon name="warn" size={12} stroke={2.5} style={{ marginLeft: 'auto' }} />}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="row-wrap small muted" style={{ gap: 16 }}>
            <span>{mode === 'views' ? 'Views per unit:' : mode === 'bookings' ? 'Bookings:' : 'View → booking:'}</span>
            <span className="row" style={{ gap: 0, borderRadius: 3, overflow: 'hidden' }}>
              {SCALE.map((c) => (
                <span key={c} style={{ width: 28, height: 12, background: c }} />
              ))}
            </span>
            <span>{mode === 'views' ? '0 → 200+' : mode === 'bookings' ? '0 → 3+' : '0% → 5%+'}</span>
            <span className="row" style={{ gap: 4 }}>
              <span style={{ width: 14, height: 14, borderRadius: 3, outline: '2px solid var(--accent-500)', outlineOffset: -2 }} />
              <Icon name="warn" size={12} stroke={2.5} color="var(--text)" />
              High interest, low conversion (≥120 views, 0 booked)
            </span>
          </div>
        </section>

        <aside className="stack-3 min0" style={{ flex: '1 1 320px' }}>
          <section aria-labelledby="h-ins" className="panel panel--clip">
            <div className="panel__head">
              <h2 id="h-ins" className="panel__title">
                What the pattern says
              </h2>
            </div>
            {INSIGHTS.map((i) => (
              <div key={i.t} className="stack-2" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', gap: 6 }}>
                <b className="strong">{i.t}</b>
                <span className="small text-2">{i.d}</span>
                <div>
                  {i.to ? (
                    <Link to={i.to} className="btn btn--secondary btn--xs" style={{ height: 32 }}>
                      {i.a}
                    </Link>
                  ) : (
                    <button type="button" className="btn btn--secondary btn--xs" style={{ height: 32 }} onClick={() => toast({ text: 'Assignment rule drafted: studio leads → Maryam Baig' })}>
                      {i.a}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </section>
          <section className="panel stack-2 small" style={{ padding: '12px 16px', gap: 6 }}>
            <b style={{ fontSize: 14 }}>Remaining stock by type</b>
            {[
              ['3-bed', 11, 61],
              ['2-bed', 14, 50],
              ['1-bed', 15, 46],
              ['Studio', 19, 32],
            ].map(([t, n, p]) => (
              <div key={t} className="row" style={{ justifyContent: 'space-between' }}>
                <span>{t}</span>
                <span>
                  <b>{n}</b> of 28 left · {p}% sold
                </span>
              </div>
            ))}
          </section>
        </aside>
      </div>
    </>
  );
}
