import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { InsightFilterBar } from '../components/InsightFilters';
import { useToast } from '../lib/toast';

const K = (label: string, v: string, delta: string, good: boolean, up: boolean, note: string, to = '/leads') => ({ label, v, delta, good, up, note, to });
const KPIS = [
  K('Leads', '1,284', '+12% vs prev.', true, true, '214 unassigned'),
  K('Avg first response', '38 min', '+9 min', false, true, 'Target 15 min', '/leaks'),
  K('Untouched > 24h', '38', '+14', false, true, 'Click to assign'),
  K('Visit → booking', '12.4%', '−1.8 pts', false, false, '27 of 217 visits'),
  K('Bookings', '27', '+4', true, true, 'PKR 52.4 Cr', '/bookings?tab=all'),
  K('Pipeline value', 'PKR 86.4 Cr', '+6%', true, true, 'Weighted by stage', '/pipeline'),
];

const FUNNEL: [string, number, number, number | null][] = [
  ['New', 1284, 1284, null],
  ['Contacted', 1120, 1150, 87],
  ['Qualified', 702, 690, 63],
  ['Units of interest', 488, 470, 70],
  ['Visit scheduled', 356, 330, 73],
  ['Visit done', 217, 244, 61],
  ['Payment plan shared', 168, 170, 77],
  ['Negotiation', 74, 70, 44],
  ['Token', 33, 31, 45],
  ['Agreement', 27, 25, 82],
];

const WEEKS = [4, 5, 3, 6, 7, 5, 6, 8, 4, 7, 9, 7];
const WEEK_L = ['17 Aug', '24', '31', '7 Sep', '14', '21', '28', '5 Oct', '12', '19', '26', '2 Nov'];

const TEAM = [
  { name: 'Sana Naveed', b: 5, o: 6, oTone: 'bad', r: '1h 12m', l: 52, act: 'Move 10 leads to Maryam' },
  { name: 'Usman Tariq', b: 2, o: 4, oTone: 'warn', r: '24 min', l: 48, act: 'Review Faraz Ahmed deal' },
  { name: 'Fahad Nadeem', b: 0, o: 2, oTone: 'none', r: '11 min', l: 44, act: 'No action' },
  { name: 'Maryam Baig', b: 0, o: 0, oTone: 'none', r: '9 min', l: 31, act: 'Has capacity — assign' },
];

export function Dashboard() {
  const toast = useToast();
  return (
    <>
      <div className="row-wrap">
        <h1 className="t-h1" style={{ marginRight: 8 }}>
          Dashboard
        </h1>
        <InsightFilterBar />
        <span className="spacer" />
        <span className="small muted">Updated 2 min ago</span>
      </div>

      <div className="grid-tiles grid-tiles--6">
        {KPIS.map((k) => (
          <Link key={k.label} to={k.to} data-tour={`kpi-${k.label}`} className="kpi" style={{ padding: '12px 14px' }}>
            <span className="kpi__label ellipsis">{k.label}</span>
            <span className="kpi__value">{k.v}</span>
            <span className="kpi__sub row" style={{ gap: 4, color: k.good ? 'var(--success)' : 'var(--danger)' }}>
              <Icon name={k.up ? 'up' : 'down'} size={10} stroke={3} />
              {k.delta}
            </span>
            <span className="xsmall muted">{k.note}</span>
          </Link>
        ))}
      </div>

      <div className="split split--stretch">
        <section aria-labelledby="h-conv" className="panel stack-3" style={{ flex: '3 1 560px', padding: 16 }}>
          <div className="row-wrap" style={{ alignItems: 'baseline', gap: 12 }}>
            <h2 id="h-conv" className="panel__title">
              Stage-to-stage conversion
            </h2>
            <span className="small muted">Leads created in period, furthest stage reached · grey tick = previous period</span>
          </div>
          <div className="stack-1">
            {FUNNEL.map(([name, n, prev, conv]) => {
              const drop = name === 'Visit done';
              return (
                <Link key={name} to="/leads" className="funnel-row" aria-label={`${name}: ${n.toLocaleString('en-US')} leads${conv ? `, ${conv}% from previous stage` : ''}`}>
                  <span className="small ellipsis">{name}</span>
                  <span className="funnel-row__track" data-tour={name === 'Visit done' ? 'funnel-drop' : undefined}>
                    <span className="funnel-row__bar" style={{ width: `${((n / 1284) * 100).toFixed(1)}%` }} />
                    <span className="funnel-row__prev" style={{ left: `${((prev / 1284) * 100).toFixed(1)}%` }} />
                  </span>
                  <span className="right strong">{n.toLocaleString('en-US')}</span>
                  <span className={`funnel-row__conv ${drop ? 'is-drop' : ''}`}>{conv === null ? '—' : `${conv}%${drop ? ' ▼' : ''}`}</span>
                </Link>
              );
            })}
          </div>
          <div className="callout callout--danger">
            <Icon name="warn" color="var(--danger)" />
            <span className="callout__text">
              <b>Biggest drop: Visit scheduled → Visit done (61%)</b>, down from 74%. 19 no-shows had no reminder sent.
            </span>
            <Link to="/leaks" className="strong">
              Open in Leak finder
            </Link>
          </div>
        </section>

        <section aria-labelledby="h-trend" className="panel stack-3" style={{ flex: '2 1 380px', padding: 16 }}>
          <div className="row-wrap" style={{ alignItems: 'baseline', gap: 12 }}>
            <h2 id="h-trend" className="panel__title spacer">
              Bookings per week
            </h2>
            <span className="row small muted" style={{ gap: 12 }}>
              <span className="row" style={{ gap: 4 }}>
                <span className="legend-sq" style={{ background: 'var(--brand-600)' }} />
                Bookings
              </span>
              <span className="row" style={{ gap: 4 }}>
                <span style={{ width: 10, height: 2, background: 'var(--accent-500)' }} />
                Target 6/wk
              </span>
            </span>
          </div>
          <div className="row" style={{ alignItems: 'stretch' }}>
            <div className="col xsmall muted right" style={{ justifyContent: 'space-between', height: 200, width: 16 }}>
              <span>10</span>
              <span>5</span>
              <span>0</span>
            </div>
            <div className="barchart" role="img" aria-label={`Bookings per week: ${WEEKS.join(', ')}. Target 6 per week.`}>
              <span className="barchart__target" style={{ top: '40%' }} />
              <span className="barchart__grid" style={{ top: '50%' }} />
              <div className="barchart__bars">
                {WEEKS.map((n, i) => (
                  <div key={i} className="barchart__col">
                    <span className="xsmall strong text-2">{n}</span>
                    <span className="barchart__bar" style={{ height: `${n * 10}%`, background: i >= 8 ? 'var(--brand-600)' : 'var(--seq-2)' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="row" style={{ gap: 6, paddingLeft: 28, paddingRight: 4 }}>
            {WEEK_L.map((l, i) => (
              <span key={i} className="spacer muted nowrap" style={{ fontSize: 10, textAlign: 'center' }}>
                {l}
              </span>
            ))}
          </div>
          <div className="grid-tiles grid-tiles--3 small" style={{ gap: 8, borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
            <div className="kv">
              <span>Last 4 weeks</span>
              <b className="t-h3">27 bookings</b>
            </div>
            <div className="kv">
              <span>Booked value</span>
              <b className="t-h3">PKR 52.4 Cr</b>
            </div>
            <div className="kv">
              <span>Avg discount</span>
              <b className="t-h3">3.1%</b>
            </div>
          </div>
        </section>
      </div>

      <section aria-labelledby="h-team" className="panel panel--clip">
        <div className="panel__head panel__head--baseline">
          <h2 id="h-team" className="panel__title spacer">
            Who needs help today
          </h2>
          <Link to="/scorecards" className="strong">
            All scorecards
          </Link>
        </div>
        <div className="table-scroll">
          <table className="dt" style={{ minWidth: 760 }}>
            <thead>
              <tr>
                <th>Agent</th>
                <th className="num">SLA breaches today</th>
                <th className="num">Overdue follow-ups</th>
                <th className="num">Avg first response</th>
                <th className="num">Open leads</th>
                <th>Suggested action</th>
              </tr>
            </thead>
            <tbody>
              {TEAM.map((t) => (
                <tr key={t.name}>
                  <td className="strong">{t.name}</td>
                  <td className="num strong" style={{ color: t.b > 0 ? 'var(--danger)' : undefined }}>
                    {t.b}
                  </td>
                  <td className="num strong" style={{ color: t.oTone === 'bad' ? 'var(--danger)' : t.oTone === 'warn' ? 'var(--warning)' : undefined }}>
                    {t.o}
                  </td>
                  <td className="num">{t.r}</td>
                  <td className="num">{t.l}</td>
                  <td>
                    <button type="button" className="btn btn--secondary btn--xs" disabled={t.act === 'No action'} onClick={() => toast({ text: `${t.act} — done` })}>
                      {t.act}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
