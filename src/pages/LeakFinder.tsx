import { Link } from 'react-router-dom';
import { InsightFilterBar } from '../components/InsightFilters';
import { Button, UnitTag } from '../components/ui';
import { useToast } from '../lib/toast';

const TTFC: [string, number, number][] = [
  ['< 5 min', 214, 44],
  ['5–15 min', 198, 38],
  ['15–60 min', 263, 24],
  ['1–4 h', 221, 17],
  ['4–24 h', 189, 12],
  ['1–3 days', 98, 9],
  ['> 3 days', 44, 5],
  ['Never', 57, 0],
];
const MAX = 263;

const LOST: [string, number, string][] = [
  ['Price above budget', 23, 'PKR 44 Cr'],
  ['Not reachable (5 tries)', 19, 'PKR 31 Cr'],
  ['Bought elsewhere', 14, 'PKR 29 Cr'],
  ['Payment plan terms', 11, 'PKR 24 Cr'],
  ['Wants ready possession', 9, 'PKR 21 Cr'],
  ['Location / distance', 6, 'PKR 11 Cr'],
  ['Duplicate / fake', 4, '—'],
  ['Other', 2, 'PKR 3 Cr'],
];

const STUCK: [string, string, string, number, number, string, string][] = [
  ['Faraz Ahmed', 'Negotiation', 'B-504', 1.85, 12, 'Usman Tariq', 'Call · 6 days ago'],
  ['Amna Tariq', 'Qualified', 'P-2', 5.6, 5, 'Unassigned', 'Zameen API · 5d'],
  ['Omer Farooq', 'Visit done', 'B-1001', 2.05, 6, 'Unassigned', 'Dealer note · 6d'],
  ['Shahzad Malik', 'Payment plan shared', 'C-1401', 2.6, 11, 'Fahad Nadeem', 'WhatsApp · 4d'],
  ['Tariq Mehmood', 'Qualified', '3-bed', 2.4, 9, 'Unassigned', 'Import · 9d'],
  ['Nadia Farooq', 'Payment plan shared', 'C-1102', 2.4, 9, 'Maryam Baig', 'Call · 3d'],
  ['Imran Shah', 'Visit scheduled', 'B-405', 1.8, 9, 'Sana Naveed', 'Note · 2d'],
  ['Rubina Khalid', 'Agreement', 'A-1402', 2.3, 34, 'Usman Tariq', 'Docs pending · 8d'],
];

export function LeakFinder() {
  const toast = useToast();
  // Risk = deal value × days stuck.
  const scored = STUCK.map((s) => ({ s, score: s[3] * s[4] })).sort((a, z) => z.score - a.score);
  const top = scored[0].score;
  return (
    <>
      <div className="row-wrap">
        <h1 className="t-h1" style={{ marginRight: 8 }}>
          Leak finder
        </h1>
        <span className="muted">Where leads and money are slipping · last 30 days</span>
        <span className="spacer" />
        <InsightFilterBar />
      </div>

      <div className="split split--stretch">
        <section aria-labelledby="h-ttfc" className="panel stack-3" style={{ flex: '3 1 520px', padding: 16 }}>
          <div className="row-wrap" style={{ alignItems: 'baseline', gap: 12 }}>
            <h2 id="h-ttfc" className="panel__title spacer">
              Time to first contact
            </h2>
            <span className="small muted">Bars = leads · number under bar = % that reached a site visit</span>
          </div>
          <div className="ttfc">
            {TTFC.map(([l, n, v], i) => (
              <Link key={l} to="/leads" className="ttfc__col" aria-label={`${l}: ${n} leads, ${v}% reached a visit`}>
                <span className="small strong" style={{ color: 'var(--text)' }}>
                  {n}
                </span>
                <span
                  className="ttfc__bar"
                  style={{
                    height: `${((n / MAX) * 85).toFixed(0)}%`,
                    background: i < 2 ? 'var(--brand-600)' : i === 7 ? 'var(--surface)' : 'var(--seq-2)',
                    border: i === 7 ? '2px dashed var(--danger)' : 0,
                  }}
                />
              </Link>
            ))}
            <span className="ttfc__sla" />
            <span className="ttfc__sla-label">SLA 15 min</span>
          </div>
          <div className="row" style={{ alignItems: 'flex-start' }}>
            {TTFC.map(([l, , v]) => (
              <div key={l} className="col spacer" style={{ alignItems: 'center', gap: 2, textAlign: 'center' }}>
                <span className="xsmall text-2">{l}</span>
                <span className="small bold" style={{ color: v >= 24 ? 'var(--success)' : v >= 10 ? 'var(--text-2)' : 'var(--danger)' }}>
                  {v}% visit
                </span>
              </div>
            ))}
          </div>
          <div className="callout callout--brand">
            <span className="callout__text">
              Leads called within 15 min reach a visit <b>3.4×</b> as often (41% vs 12%). <b>412 leads (32%)</b> waited over an hour; 57 were never called.
            </span>
            <Link to="/leads" className="strong">
              Assign the 57
            </Link>
          </div>
        </section>

        <section aria-labelledby="h-lost" className="panel stack-2" style={{ flex: '2 1 360px', padding: 16, gap: 10 }}>
          <div className="row" style={{ alignItems: 'baseline', gap: 12 }}>
            <h2 id="h-lost" className="panel__title spacer">
              Lost reasons
            </h2>
            <span className="small muted">88 lost · PKR 1.71 Bn budget</span>
          </div>
          {LOST.map(([r, n, v], i) => (
            <Link key={r} to="/leads" className="lost-row" aria-label={`${r}: ${n} leads, ${v}`}>
              <span className="ellipsis">{r}</span>
              <span className="track track--12" style={{ borderRadius: 3, background: 'var(--surface-2)' }}>
                <span style={{ width: `${((n / 23) * 100).toFixed(0)}%`, background: i === 0 ? 'var(--danger)' : 'var(--neutral-500)', borderRadius: 3 }} />
              </span>
              <span className="right strong">{n}</span>
              <span className="right muted">{v}</span>
            </Link>
          ))}
          <div className="small text-2" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
            “Price above budget” doubled after price list v7 (1 Oct). 14 of 23 were 2-bed, floors 9–12.
          </div>
        </section>
      </div>

      <section aria-labelledby="h-stuck" className="panel panel--clip">
        <div className="panel__head panel__head--baseline">
          <h2 id="h-stuck" className="panel__title">
            Stuck deals
          </h2>
          <span className="small muted spacer">Past stage SLA · sorted by deal value × days stuck</span>
          <Button size="sm" onClick={() => toast({ text: 'Stuck deals exported (CSV)' })}>
            Export
          </Button>
        </div>
        <div className="table-scroll">
          <table className="dt" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>Lead</th>
                <th>Stage</th>
                <th>Unit</th>
                <th className="num">Value</th>
                <th className="num">Stuck</th>
                <th>Risk score ↓</th>
                <th>Owner</th>
                <th>Last activity</th>
              </tr>
            </thead>
            <tbody>
              {scored.map(({ s, score }) => (
                <tr key={s[0]}>
                  <td>
                    <Link to="/leads/L-20931" className="cell-link">
                      {s[0]}
                    </Link>
                  </td>
                  <td className="small">{s[1]}</td>
                  <td>
                    <UnitTag>{s[2]}</UnitTag>
                  </td>
                  <td className="num strong">PKR {s[3].toFixed(2)} Cr</td>
                  <td className="num bold danger-text">{s[4]}d</td>
                  <td>
                    <span className="row">
                      <span className="track track--8 spacer" style={{ background: 'var(--surface-2)' }}>
                        <span style={{ width: `${((score / top) * 100).toFixed(0)}%`, background: 'var(--danger)' }} />
                      </span>
                      <span className="small strong" style={{ width: 28 }}>
                        {Math.round(score)}
                      </span>
                    </span>
                  </td>
                  <td className="small" style={s[5] === 'Unassigned' ? { color: 'var(--danger)', fontStyle: 'italic' } : undefined}>
                    {s[5]}
                  </td>
                  <td className="small text-2">{s[6]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
