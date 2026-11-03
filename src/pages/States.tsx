import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Skel } from '../components/ui';
import { RefPage } from './RefPage';

const SETUP = [
  { t: 'Create organisation', d: 'Margalla Crest Builders · Islamabad', done: true },
  { t: 'Add your first project', d: 'Crest Heights — Tower B · 18 floors', done: true },
  { t: 'Upload inventory', d: 'Excel template: unit code, floor, type, size, price', cta: 'Upload units', primary: true },
  { t: 'Connect a lead source', d: 'Facebook Lead Ads, WhatsApp, website form, or Zameen email', cta: 'Connect' },
  { t: 'Invite your team', d: 'Agents get leads by round-robin until you set rules', cta: 'Invite' },
];

const LONG = [
  { n: 'Asma Bano', s: 'Contacted', o: 'Fahad Nadeem', b: 'PKR 1.20 Cr' },
  { n: 'Ghulam Mustafa', s: 'Qualified', o: 'Unassigned', b: 'PKR 95 lakh' },
  { n: 'Sobia Khurshid', s: 'Nurture', o: 'Maryam Baig', b: 'PKR 2.10 Cr' },
  { n: 'Arslan Haider', s: 'New', o: 'Usman Tariq', b: 'PKR 1.65 Cr' },
  { n: 'Fatima Zahra Rizvi', s: 'Contacted', o: 'Sana Naveed', b: 'PKR 3.00 Cr' },
  { n: 'Naveed Akram', s: 'Qualified', o: 'Kashif Abbasi', b: 'PKR 72 lakh' },
];

const SKEL = ['62%', '48%', '70%', '55%', '40%', '66%', '52%', '58%', '45%', '61%'];

export function States() {
  return (
    <RefPage title="States for key screens" sub="Every list and dashboard ships with these five states. Shell (top bar + nav) omitted here; it is always present and usable.">
      <div className="ref-grid-2">
        <section aria-labelledby="st-empty" className="stack-2">
          <span className="ref-label">1 · Empty — new Organization, no leads yet (Owner/Admin)</span>
          <div className="panel stack-4" style={{ padding: 32, minHeight: 520, gap: 20 }}>
            <div>
              <h2 id="st-empty" className="t-h2">
                Set up Margalla Crest Builders
              </h2>
              <span className="muted">Leads appear here once a source is connected. Most teams finish setup in about 20 minutes.</span>
            </div>
            <ol className="plain-list panel panel--clip">
              {SETUP.map((s) => (
                <li key={s.t} className="list-row">
                  <span className={`setup-dot ${s.done ? 'is-done' : ''}`}>{s.done && <Icon name="check" size={12} stroke={3} label="Done" />}</span>
                  <span className="col spacer">
                    <b className="strong" style={{ textDecoration: s.done ? 'line-through' : undefined, color: s.done ? 'var(--text-muted)' : undefined }}>
                      {s.t}
                    </b>
                    <span className="small muted">{s.d}</span>
                  </span>
                  {s.cta && (
                    <button type="button" className={`btn btn--sm ${s.primary ? 'btn--primary' : 'btn--secondary'}`}>
                      {s.cta}
                    </button>
                  )}
                </li>
              ))}
            </ol>
            <div className="row-wrap small muted">
              <span>Prefer to start with existing data?</span>
              <a href="#import" className="strong">
                Import leads from Excel / CSV
              </a>
              <span>· duplicates matched on phone and CNIC</span>
            </div>
          </div>
        </section>

        <section className="stack-2">
          <span className="ref-label">2 · Loading — skeleton matches the leads table; filters stay interactive</span>
          <div aria-busy="true" aria-label="Loading leads" className="panel panel--clip" style={{ minHeight: 520 }}>
            <div className="row" style={{ padding: 12, borderBottom: '1px solid var(--border)' }}>
              <span className="filter-chip small">
                Stage: <b>Qualified</b>
              </span>
              <span className="filter-chip small">Source</span>
              <Skel w={90} h={32} />
            </div>
            <table className="dt">
              <thead>
                <tr>
                  <th className="dt__check" />
                  <th>Lead</th>
                  <th>Stage</th>
                  <th>Owner</th>
                  <th>Budget</th>
                </tr>
              </thead>
              <tbody>
                {SKEL.map((a, i) => (
                  <tr key={i} style={{ height: 44 }}>
                    <td>
                      <Skel w={14} h={14} />
                    </td>
                    <td>
                      <span className="stack-1" style={{ gap: 6 }}>
                        <Skel w={a} />
                        <Skel w="40%" h={8} />
                      </span>
                    </td>
                    <td>
                      <Skel w={`${40 + ((i * 7) % 30)}%`} />
                    </td>
                    <td>
                      <Skel w="60%" />
                    </td>
                    <td>
                      <Skel w="50%" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="stack-2">
          <span className="ref-label">3 · Error — partial failure keeps the rest of the page; full failure keeps filters and offers retry</span>
          <div className="panel stack-4" style={{ padding: 16, minHeight: 420 }}>
            <div role="alert" className="callout callout--warning" style={{ color: 'var(--text)' }}>
              <Icon name="wifi" />
              <span className="callout__text">
                <b>You're offline.</b> Call logs and notes are saved on this device and will sync when you reconnect (3 pending).
              </span>
            </div>
            <div className="grid-tiles grid-tiles--3" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              <div className="kpi">
                <span className="kpi__label">Bookings</span>
                <b className="kpi__value">27</b>
                <span className="kpi__sub success-text">+4 vs prev.</span>
              </div>
              <div role="alert" className="kpi" style={{ background: 'var(--danger-surface)', borderColor: 'var(--danger-border)' }}>
                <span className="kpi__label">Pipeline value</span>
                <span className="row strong danger-text" style={{ gap: 6 }}>
                  <Icon name="warn" size={14} stroke={2.5} />
                  Couldn't calculate
                </span>
                <button type="button" className="btn btn--secondary btn--xs" style={{ alignSelf: 'flex-start' }}>
                  Retry
                </button>
              </div>
            </div>
            <div className="panel empty">
              <Icon name="warn" size={28} stroke={1.8} color="var(--danger)" />
              <b className="t-h3">Leads couldn't load</b>
              <span className="text-2">The server took too long (over 10 s). Your filters and selection are kept. If it keeps happening, share the reference with support.</span>
              <span className="small muted">Ref: req_8f21c · 3 Nov 14:32 PKT</span>
              <div className="row">
                <button type="button" className="btn btn--primary">
                  Try again
                </button>
                <button type="button" className="btn btn--secondary" onClick={() => navigator.clipboard?.writeText('req_8f21c')}>
                  Copy reference
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="stack-2">
          <span className="ref-label">4 · Very long list — 5,342 leads, virtualised rows, server-side select-all, background bulk job</span>
          <div className="panel panel--clip" style={{ minHeight: 420, display: 'flex', flexDirection: 'column' }}>
            <div className="callout callout--brand" style={{ borderRadius: 0, border: 0, borderBottom: '1px solid var(--brand-tint-border)' }}>
              <span>
                All <b>100</b> leads on this page are selected.
              </span>
              <button type="button" className="btn btn--ghost btn--xs">
                Select all 5,342 matching this view
              </button>
            </div>
            <table className="dt">
              <thead>
                <tr>
                  <th className="dt__check">
                    <input type="checkbox" defaultChecked aria-label="Page selected" />
                  </th>
                  <th>Lead</th>
                  <th>Stage</th>
                  <th>Owner</th>
                  <th className="num">Budget</th>
                </tr>
              </thead>
              <tbody>
                {LONG.map((l) => (
                  <tr key={l.n} className="is-selected">
                    <td className="dt__check">
                      <input type="checkbox" defaultChecked aria-label={`Select ${l.n}`} />
                    </td>
                    <td className="strong">{l.n}</td>
                    <td>{l.s}</td>
                    <td>{l.o}</td>
                    <td className="num">{l.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="row-wrap small muted" style={{ padding: '8px 12px', justifyContent: 'space-between' }}>
              <span>Rows 2,101–2,106 of 5,342 · scrollbar jumps by page, Ctrl/⌘ G to go to row</span>
              <span>Counts are exact up to 10,000, then “10,000+”</span>
            </div>
            <div role="status" className="toast" style={{ margin: 'auto 12px 12px', flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
              <div className="row" style={{ gap: 12 }}>
                <span className="spacer">
                  <b>Moving 5,342 leads to Nurture</b> · 2,031 done · you can leave this page
                </span>
                <button type="button" className="toast__action">
                  Cancel
                </button>
              </div>
              <span className="track track--4" style={{ background: '#3A423E' }}>
                <span style={{ width: '38%', background: 'var(--accent-500)' }} />
              </span>
            </div>
          </div>
        </section>

        <section className="stack-2" style={{ gridColumn: '1 / -1' }}>
          <span className="ref-label">5 · Permission-restricted — page-level (Dealer opens Dashboard) and record-level (Agent opens a colleague's lead)</span>
          <div className="ref-grid-2">
            <div className="panel stack-3" style={{ padding: 32, alignItems: 'flex-start' }}>
              <span className="lock-tile">
                <Icon name="lock" size={20} stroke={1.8} color="var(--text-2)" />
              </span>
              <b className="t-h2">Dashboard is for Saffron Developers staff</b>
              <span className="text-2">Dealer accounts can see their own referrals, unit availability and commission. Team-wide numbers aren't shared with external partners.</span>
              <div className="row">
                <Link to="/leads" className="btn btn--primary">
                  Go to My referrals
                </Link>
                <Link to="/bookings?tab=all" className="btn btn--secondary">
                  View my commission
                </Link>
              </div>
            </div>
            <div className="panel stack-3" style={{ padding: 20 }}>
              <div className="row" style={{ gap: 12 }}>
                <span className="avatar avatar--40">NF</span>
                <div className="spacer">
                  <b className="t-h3">Nadia Farooq</b>
                  <div className="small muted">Payment plan shared · Owner: Maryam Baig</div>
                </div>
              </div>
              <div role="note" className="callout callout--neutral">
                <Icon name="lock" color="var(--text-2)" style={{ marginTop: 2 }} />
                <span className="callout__text">
                  This lead belongs to <b>Maryam Baig</b>. You can see the unit and stage, but contact details and activity are hidden. Found it because the buyer called you?
                </span>
              </div>
              <dl className="dl" style={{ gridTemplateColumns: '120px 1fr', fontSize: 14 }}>
                <dt>Mobile</dt>
                <dd>0300 ••• ••56</dd>
                <dt>Unit</dt>
                <dd>C-1102 · 3-bed</dd>
                <dt>Activity</dt>
                <dd className="muted">Hidden — 14 entries</dd>
              </dl>
              <div className="row-wrap">
                <button type="button" className="btn btn--primary">
                  Log inbound call for Maryam
                </button>
                <button type="button" className="btn btn--secondary">
                  Request ownership
                </button>
                <span className="why">
                  <button type="button" disabled className="btn btn--secondary" aria-describedby="why-stage">
                    Change stage
                  </button>
                  <span role="tooltip" id="why-stage" className="why__tip">
                    Only the owner or a Sales Manager can change the stage
                  </span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </RefPage>
  );
}
