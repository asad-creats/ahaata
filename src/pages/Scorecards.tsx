import { InsightFilterBar } from '../components/InsightFilters';
import { useToast } from '../lib/toast';

type M = { t: string; bad?: boolean; bold?: boolean };
const G = (t: string): M => ({ t });
const Bd = (t: string): M => ({ t, bad: true });
const B = (t: string): M => ({ t, bold: true });

const AGENTS: { name: string; m: M[]; spark: number[] }[] = [
  { name: 'Usman Tariq', m: [G('148'), G('24 min'), G('91%'), G('31'), G('19%'), B('6'), G('PKR 11.6 Cr'), Bd('9')], spark: [3, 4, 5, 4, 5, 6] },
  { name: 'Maryam Baig', m: [G('112'), G('9 min'), G('96%'), G('22'), G('23%'), B('5'), G('PKR 9.1 Cr'), G('1')], spark: [2, 3, 3, 4, 4, 5] },
  { name: 'Fahad Nadeem', m: [G('139'), G('11 min'), G('94%'), G('28'), G('14%'), B('4'), G('PKR 8.2 Cr'), G('2')], spark: [4, 3, 4, 5, 3, 4] },
  { name: 'Sana Naveed', m: [G('157'), Bd('1h 12m'), Bd('72%'), Bd('16'), Bd('6%'), B('1'), G('PKR 1.8 Cr'), Bd('23')], spark: [3, 3, 2, 2, 1, 1] },
  { name: 'Kashif Abbasi', m: [G('96'), G('14 min'), G('89%'), G('19'), G('16%'), B('3'), G('PKR 4.0 Cr'), G('3')], spark: [2, 2, 3, 2, 3, 3] },
  { name: 'Zainab Hashmi (new)', m: [G('41'), G('18 min'), G('85%'), Bd('6'), G('17%'), B('1'), G('PKR 1.9 Cr'), G('2')], spark: [0, 0, 0, 0, 0, 1] },
];

const DEALERS = [
  { name: 'Al-Noor Estate & Builders', r: 34, dup: 3, b: 4, rate: '13%', c: 'PKR 7.4 L' },
  { name: 'Capital Homes Network', r: 22, dup: 1, b: 2, rate: '10%', c: 'PKR 3.9 L' },
  { name: 'Pindi Property Point', r: 41, dup: 17, b: 1, rate: '4%', c: 'PKR 1.8 L' },
  { name: 'Gulf Link Realty (Dubai)', r: 9, dup: 0, b: 2, rate: '22%', c: 'AED 9,200' },
];

const SOURCES = [
  { n: 'Facebook', spend: 'PKR 6.95 L', leads: 560, cpl: '1,240', b: 2, cpb: '3.48 L', w: 100, bad: true },
  { n: 'Zameen', spend: 'PKR 4.80 L', leads: 148, cpl: '3,243', b: 4, cpb: '1.20 L', w: 34 },
  { n: 'Graana', spend: 'PKR 2.10 L', leads: 96, cpl: '2,188', b: 1, cpb: '2.10 L', w: 60 },
  { n: 'Expo (Lahore, Oct)', spend: 'PKR 9.50 L', leads: 210, cpl: '4,524', b: 6, cpb: '1.58 L', w: 45 },
  { n: 'Dealers', spend: 'Commission', leads: 106, cpl: '—', b: 9, cpb: '1.45 L', w: 42 },
  { n: 'Walk-in / Website', spend: 'PKR 0', leads: 164, cpl: '—', b: 5, cpb: '—', w: 0 },
];

const HEAD = ['Leads', 'First response', 'Contact rate', 'Visits', 'Visit → booking', 'Bookings ↓', 'Value', 'SLA breaches'];

export function Scorecards() {
  const toast = useToast();
  return (
    <>
      <div className="row-wrap">
        <h1 className="t-h1" style={{ marginRight: 8 }}>
          Scorecards
        </h1>
        <span className="muted">October 2026</span>
        <span className="spacer" />
        <InsightFilterBar />
        <button type="button" className="btn btn--secondary btn--sm" onClick={() => toast({ text: 'Scorecards exported as PDF' })}>
          Export PDF
        </button>
      </div>

      <section aria-labelledby="h-ag" className="panel panel--clip">
        <div className="panel__head panel__head--baseline">
          <h2 id="h-ag" className="panel__title spacer">
            Agents
          </h2>
          <span className="small muted">Sorted by bookings · red = below team median on that metric (also marked ▼)</span>
        </div>
        <div className="table-scroll">
          <table className="dt" style={{ minWidth: 980 }}>
            <thead>
              <tr>
                <th>Agent</th>
                {HEAD.map((h) => (
                  <th key={h} className={`num ${h.includes('↓') ? 'is-sorted' : ''}`}>
                    {h}
                  </th>
                ))}
                <th>Bookings, 6 mo</th>
              </tr>
            </thead>
            <tbody>
              {AGENTS.map((a) => (
                <tr key={a.name}>
                  <td className="strong">{a.name}</td>
                  {a.m.map((m, i) => (
                    <td key={i} className="num" style={{ color: m.bad ? 'var(--danger)' : undefined, fontWeight: m.bad ? 600 : m.bold ? 700 : 400 }}>
                      {m.t}
                      {m.bad && ' ▼'}
                    </td>
                  ))}
                  <td>
                    <span className="spark" role="img" aria-label={`Bookings last 6 months: ${a.spark.join(', ')}`}>
                      {a.spark.map((v, i) => (
                        <span key={i} style={{ height: v * 3 + 2, background: i === 5 ? 'var(--brand-600)' : 'var(--seq-2)' }} />
                      ))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="split">
        <section aria-labelledby="h-dl" className="panel panel--clip" style={{ flex: '1 1 480px', minWidth: 0 }}>
          <div className="panel__head">
            <h2 id="h-dl" className="panel__title">
              Dealers
            </h2>
          </div>
          <div className="table-scroll">
            <table className="dt">
              <thead>
                <tr>
                  <th>Dealer</th>
                  <th className="num">Referred</th>
                  <th className="num">Duplicates</th>
                  <th className="num">Bookings</th>
                  <th className="num">Rate</th>
                  <th className="num">Commission due</th>
                </tr>
              </thead>
              <tbody>
                {DEALERS.map((d) => (
                  <tr key={d.name}>
                    <td className="strong ellipsis" style={{ maxWidth: 220 }}>
                      {d.name}
                    </td>
                    <td className="num">{d.r}</td>
                    <td className="num" style={d.dup > 10 ? { color: 'var(--danger)', fontWeight: 600 } : undefined}>
                      {d.dup}
                      {d.dup > 10 && ' ▼'}
                    </td>
                    <td className="num strong">{d.b}</td>
                    <td className="num">{d.rate}</td>
                    <td className="num">{d.c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="panel__foot">Duplicates = phone or CNIC already in CRM when referred. Commission is paid only on referrals that were not duplicates.</div>
        </section>

        <section aria-labelledby="h-src" className="panel panel--clip" style={{ flex: '1 1 520px', minWidth: 0 }}>
          <div className="panel__head">
            <h2 id="h-src" className="panel__title">
              Sources — cost per lead vs cost per booking
            </h2>
          </div>
          <div className="table-scroll">
            <table className="dt">
              <thead>
                <tr>
                  <th>Source</th>
                  <th className="num">Spend</th>
                  <th className="num">Leads</th>
                  <th className="num">Per lead</th>
                  <th className="num">Bookings</th>
                  <th>Cost per booking</th>
                </tr>
              </thead>
              <tbody>
                {SOURCES.map((x) => (
                  <tr key={x.n}>
                    <td className="strong">{x.n}</td>
                    <td className="num">{x.spend}</td>
                    <td className="num">{x.leads}</td>
                    <td className="num">{x.cpl}</td>
                    <td className="num strong">{x.b}</td>
                    <td>
                      <span className="row">
                        <span className="track track--10 spacer" style={{ background: 'var(--surface-2)', borderRadius: 3, minWidth: 60 }}>
                          <span style={{ width: `${x.w}%`, background: x.bad ? 'var(--danger)' : 'var(--brand-600)', borderRadius: 3 }} />
                        </span>
                        <span className="small strong right" style={{ width: 64 }}>
                          {x.cpb}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="callout callout--accent small" style={{ borderRadius: 0, borderLeft: 0, borderRight: 0, borderBottom: 0 }}>
            Facebook has the cheapest leads (PKR 1,240) but the most expensive bookings (PKR 3.48 lakh). Zameen costs 2.6× more per lead but about a third as much per booking.
          </div>
        </section>
      </div>
    </>
  );
}
