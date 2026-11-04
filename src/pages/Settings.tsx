import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Chip, type Tone } from '../components/ui';
import { useSession } from '../lib/session';
import { useToast } from '../lib/toast';

const ROLES = ['Owner/Admin', 'Sales Manager', 'Agent', 'Dealer', 'Finance'];

const USERS = [
  { ini: 'SM', name: 'Sana Malik', meta: 'sana@saffrondev.pk · all projects', role: 'Owner/Admin', st: 'Active', tone: 'ok' as Tone },
  { ini: 'AK', name: 'Ayesha Khan', meta: 'Team: Tower A + B · 6 agents', role: 'Sales Manager', st: 'Active', tone: 'ok' as Tone },
  { ini: 'UT', name: 'Usman Tariq', meta: 'Saffron Residencia · Tower B', role: 'Agent', st: 'Active', tone: 'ok' as Tone },
  { ini: 'KA', name: 'Kashif Abbasi', meta: 'Saffron Gardens', role: 'Agent', st: 'On leave', tone: 'warn' as Tone },
  { ini: 'AN', name: 'Al-Noor Estate & Builders (Chaklala)', meta: 'External dealer · 3 users', role: 'Dealer', st: 'Active', tone: 'ok' as Tone },
  { ini: 'RM', name: 'Rashid Mahmood', meta: 'Accounts · both projects', role: 'Finance', st: 'Invited', tone: 'neutral' as Tone },
];

type P = { t: string; tone: 'yes' | 'no' | 'own' | 'team' | 'view' | 'req' };
const Y: P = { t: 'Yes', tone: 'yes' };
const N: P = { t: '—', tone: 'no' };
const O: P = { t: 'Own', tone: 'own' };
const T: P = { t: 'Team', tone: 'team' };
const V: P = { t: 'View', tone: 'view' };
const PERMS: { name: string; v: P[] }[] = [
  { name: 'See leads', v: [Y, T, O, O, N] },
  { name: 'See lead phone numbers', v: [Y, T, O, O, N] },
  { name: 'Reassign leads', v: [Y, Y, N, N, N] },
  { name: 'Hold units', v: [Y, Y, Y, { t: 'Request', tone: 'own' }, N] },
  { name: 'Edit price list', v: [Y, N, N, N, N] },
  { name: 'Record payments', v: [Y, N, N, N, Y] },
  { name: 'Insights & scorecards', v: [Y, T, O, O, V] },
  { name: 'Export data', v: [Y, T, N, N, Y] },
];
const PERM_FG: Record<P['tone'], string> = { yes: 'var(--success)', no: 'var(--text-disabled)', own: 'var(--warning)', team: 'var(--brand-900)', view: 'var(--text-2)', req: 'var(--warning)' };

const STAGES = [
  { n: 'New', sla: '15 min', p: '2%', req: 'Phone' },
  { n: 'Contacted', sla: '2 days', p: '5%', req: 'Call or WhatsApp logged' },
  { n: 'Qualified', sla: '5 days', p: '10%', req: 'Budget, unit type' },
  { n: 'Units of interest', sla: '5 days', p: '15%', req: '1+ unit attached' },
  { n: 'Visit scheduled', sla: '7 days', p: '25%', req: 'Visit date' },
  { n: 'Visit done', sla: '5 days', p: '35%', req: 'Visit log' },
  { n: 'Payment plan shared', sla: '7 days', p: '45%', req: 'Plan sent' },
  { n: 'Negotiation', sla: '7 days', p: '60%', req: '—' },
  { n: 'Token', sla: '10 days', p: '85%', req: 'Booking + token receipt' },
  { n: 'Agreement', sla: '30 days', p: '95%', req: 'CNIC, signed agreement' },
  { n: 'Instalments', sla: '—', p: '100%', req: 'Schedule generated' },
  { n: 'Possession', sla: '—', p: '100%', req: 'Possession letter' },
  { n: 'Lost', sla: '—', p: '0%', req: 'Lost reason' },
  { n: 'Nurture', sla: '30 days', p: '3%', req: 'Reason' },
];

const INTS: { ab: string; name: string; meta: string; st: string; tone: Tone; cta: string }[] = [
  { ab: 'FB', name: 'Facebook Lead Ads', meta: '3 pages · 11 forms · last lead 4 min ago', st: 'Connected', tone: 'ok', cta: 'Manage' },
  { ab: 'WA', name: 'WhatsApp Business API', meta: '+92 300 0723366 · templates: 6 approved', st: 'Token expires in 5d', tone: 'warn', cta: 'Renew' },
  { ab: 'WEB', name: 'Website forms', meta: 'saffronresidencia.pk · public inventory site', st: 'Connected', tone: 'ok', cta: 'Embed code' },
  { ab: 'ZM', name: 'Zameen / Graana enquiry email', meta: 'Parsed from leads@saffrondev.pk', st: 'Failing since 2 Nov', tone: 'bad', cta: 'Fix' },
  { ab: 'CSV', name: 'Expo / walk-in import', meta: 'Manual CSV with duplicate check on phone + CNIC', st: 'Not set up', tone: 'neutral', cta: 'Set up' },
];

const RULES = [
  { when: 'source is Dealer', then: 'keep with submitting dealer, CC Ayesha Khan', stat: 'Matched 41 leads this month' },
  { when: 'phone starts +971 / +44 / +966 (overseas)', then: 'assign to Maryam Baig', stat: 'Matched 61 leads' },
  { when: 'project is Saffron Gardens', then: 'round-robin: Kashif, Fahad (skip on leave)', stat: 'Matched 188 leads' },
  { when: 'project is Saffron Residencia', then: 'round-robin weighted by open load: 5 agents', stat: 'Matched 702 leads' },
  { when: 'nothing matched', then: 'Unassigned queue (managers notified after 10 min)', stat: 'Fallback' },
];

const AUDIT = [
  { t: 'Today 10:42', who: 'Ayesha Khan', obj: 'Lead L-20931', what: 'Owner: Sana Naveed → Usman Tariq', ip: '39.48.x.x · Web' },
  { t: 'Today 09:15', who: 'Sana Malik', obj: 'Price list B v8', what: 'Draft created: floors 4–8 rate 16,050 → 16,350', ip: '111.68.x.x · Web' },
  { t: 'Yesterday 18:03', who: 'Usman Tariq', obj: 'Unit B-504', what: 'Hold placed for Faraz Ahmed, 48h', ip: 'Android app' },
  { t: '1 Nov 14:20', who: 'Rashid Mahmood', obj: 'Booking BK-0412', what: 'Receipt RC-2291 voided and re-issued (amount typo)', ip: '39.48.x.x · Web' },
  { t: '31 Oct 11:09', who: 'System', obj: 'Assignment rule 3', what: 'Kashif Abbasi skipped: on leave until 8 Nov', ip: '—' },
];

const SECTIONS = [
  ['users', 'Users & roles'],
  ['stages', 'Stages & SLAs'],
  ['sources', 'Sources & integrations'],
  ['rules', 'Assignment rules'],
  ['audit', 'Audit log'],
  ['branding', 'Public site & branding'],
  ['billing', 'Billing'],
];

export function Settings() {
  const s = useSession();
  const toast = useToast();
  const [active, setActive] = useState('users');
  const [rulesOn, setRulesOn] = useState(RULES.map(() => true));
  const [stages, setStages] = useState(STAGES);

  return (
    <>
      <div className="page-head">
        <h1 className="t-h1">Settings</h1>
        <span className="muted">{s.org.name} · applies to all {s.org.projects.length} projects unless overridden</span>
      </div>
      <nav aria-label="Settings sections" className="tabs tabs--flush">
        {SECTIONS.map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className={`tab tab--40 ${active === id ? 'is-active' : ''}`}
            aria-current={active === id ? 'true' : undefined}
            onClick={(e) => {
              e.preventDefault();
              setActive(id);
            }}
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="settings-one">
        <section id="users" hidden={active !== 'users'} aria-labelledby="h-u" className="panel panel--clip">
          <div className="panel__head">
            <h2 id="h-u" className="panel__title spacer">
              Users &amp; roles <span className="small muted" style={{ fontWeight: 500 }}>18 of 25 seats</span>
            </h2>
            <button type="button" className="btn btn--primary btn--sm">
              Invite user
            </button>
          </div>
          {USERS.map((u) => (
            <div key={u.name} className="list-row" style={{ padding: '8px 16px', gap: 10 }}>
              <span className="avatar">{u.ini}</span>
              <span className="col spacer min0">
                <b className="strong ellipsis">{u.name}</b>
                <span className="small muted">{u.meta}</span>
              </span>
              <select aria-label={`Role for ${u.name}`} className="select select--sm small" defaultValue={u.role} onChange={(e) => toast({ text: `${u.name} is now ${e.target.value} · audit logged` })}>
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <span className="small strong" style={{ width: 64, color: u.tone === 'ok' ? 'var(--success)' : u.tone === 'warn' ? 'var(--warning)' : 'var(--text-muted)' }}>
                {u.st}
              </span>
            </div>
          ))}
          <div className="stack-2" style={{ padding: '12px 16px' }}>
            <span className="t-label">Role permissions (summary)</span>
            <div className="perm-grid" role="table" aria-label="Role permissions">
              <div role="row" style={{ display: 'contents' }}>
                <span role="columnheader">Permission</span>
                {['Admin', 'Manager', 'Agent', 'Dealer', 'Finance'].map((r) => (
                  <span key={r} role="columnheader" className="center">
                    {r}
                  </span>
                ))}
              </div>
              {PERMS.map((p) => (
                <div key={p.name} role="row" style={{ display: 'contents' }}>
                  <span role="rowheader">{p.name}</span>
                  {p.v.map((c, i) => (
                    <span key={i} role="cell" className="center strong" style={{ color: PERM_FG[c.tone] }}>
                      {c.t}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="stages" hidden={active !== 'stages'} aria-labelledby="h-s" className="panel panel--clip">
          <div className="panel__head">
            <h2 id="h-s" className="panel__title spacer">
              Stages &amp; SLAs
            </h2>
            <button type="button" className="btn btn--secondary btn--sm">
              Add stage
            </button>
          </div>
          <table className="dt dt--compact">
            <thead>
              <tr>
                <th style={{ width: 24 }}>
                  <span className="sr-only">Reorder</span>
                </th>
                <th>Stage</th>
                <th>SLA</th>
                <th>Probability</th>
                <th>Required to enter</th>
              </tr>
            </thead>
            <tbody>
              {stages.map((st, i) => (
                <tr key={st.n}>
                  <td>
                    <span aria-label={`Drag to reorder ${st.n}`} className="muted" style={{ cursor: 'grab' }}>
                      ⋮⋮
                    </span>
                  </td>
                  <td className="strong" style={{ fontSize: 14 }}>
                    {st.n}
                  </td>
                  <td>
                    <input
                      aria-label={`SLA for ${st.n}`}
                      className="input"
                      style={{ width: 72, height: 28, padding: '0 6px', fontSize: 12 }}
                      value={st.sla}
                      onChange={(e) => setStages((xs) => xs.map((x, j) => (j === i ? { ...x, sla: e.target.value } : x)))}
                    />
                  </td>
                  <td>{st.p}</td>
                  <td className="text-2">{st.req}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="panel__foot">Stage SLAs drive the age badge colour everywhere: warning at 75% of SLA, overdue at 100%.</div>
        </section>

        <section id="sources" hidden={active !== 'sources'} aria-labelledby="h-i" className="panel panel--clip">
          <div className="panel__head">
            <h2 id="h-i" className="panel__title">
              Lead sources &amp; integrations
            </h2>
          </div>
          {INTS.map((i) => (
            <div key={i.ab} className="list-row" style={{ padding: '10px 16px' }}>
              <span className="int-mark">{i.ab}</span>
              <span className="col spacer min0">
                <b className="strong">{i.name}</b>
                <span className="small muted">{i.meta}</span>
              </span>
              <Chip tone={i.tone} small icon={i.tone === 'ok' ? 'check' : i.tone === 'neutral' ? 'dot' : 'warn'}>
                {i.st}
              </Chip>
              <button type="button" className={`btn btn--xs ${i.tone === 'bad' ? 'btn--primary' : 'btn--secondary'}`} style={{ height: 32 }}>
                {i.cta}
              </button>
            </div>
          ))}
        </section>

        <section id="rules" hidden={active !== 'rules'} aria-labelledby="h-r" className="panel panel--clip">
          <div className="panel__head">
            <h2 id="h-r" className="panel__title spacer">
              Assignment rules <span className="small muted" style={{ fontWeight: 500 }}>top-down, first match wins</span>
            </h2>
            <button type="button" className="btn btn--secondary btn--sm">
              Add rule
            </button>
          </div>
          <ol className="plain-list">
            {RULES.map((r, i) => (
              <li key={r.when} className="list-row" style={{ alignItems: 'flex-start', padding: '10px 16px' }}>
                <span className="rule-n">{i + 1}</span>
                <span className="col spacer" style={{ gap: 2, opacity: rulesOn[i] ? 1 : 0.55 }}>
                  <span>
                    <span className="muted">If</span> {r.when}
                  </span>
                  <span>
                    <span className="muted">then</span> <b className="strong">{r.then}</b>
                  </span>
                  <span className="small muted">{r.stat}</span>
                </span>
                {i === RULES.length - 1 ? (
                  <span className="small muted" title="The fallback rule is always on">
                    Always on
                  </span>
                ) : (
                  <label className="check small">
                    <input type="checkbox" checked={rulesOn[i]} onChange={(e) => setRulesOn((xs) => xs.map((x, j) => (j === i ? e.target.checked : x)))} /> On
                  </label>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section id="audit" hidden={active !== 'audit'} aria-labelledby="h-a" className="panel panel--clip">
          <div className="panel__head">
            <h2 id="h-a" className="panel__title spacer">
              Audit log
            </h2>
            <span className="filter-chip small">Actor: Anyone</span>
            <span className="filter-chip small">Object: Any</span>
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => toast({ text: 'Audit log exported (CSV)' })}>
              Export CSV
            </button>
          </div>
          <div className="table-scroll">
            <table className="dt dt--compact" style={{ minWidth: 760 }}>
              <thead>
                <tr>
                  <th>When</th>
                  <th>Who</th>
                  <th>Object</th>
                  <th>Change</th>
                  <th>IP / device</th>
                </tr>
              </thead>
              <tbody>
                {AUDIT.map((a) => (
                  <tr key={a.t + a.obj}>
                    <td className="text-2">{a.t}</td>
                    <td className="strong">{a.who}</td>
                    <td>{a.obj}</td>
                    <td>{a.what}</td>
                    <td className="muted">{a.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="panel__foot">Append-only. Entries can’t be edited or deleted.</div>
        </section>
        <section id="branding" hidden={active !== 'branding'} aria-labelledby="h-b" className="panel panel--clip">
          <div className="panel__head">
            <h2 id="h-b" className="panel__title spacer">
              Public site &amp; branding
            </h2>
            <Link to="/site" className="btn btn--secondary btn--sm">
              Open public site
            </Link>
          </div>
          <div className="stack-4" style={{ padding: 16 }}>
            <div className="field">
              <span className="field__label">Brand colour</span>
              <div className="row">
                {['#0D3B2E', '#7A2E1F', '#1F3A6B', '#3A2A5C'].map((c, i) => (
                  <button key={c} type="button" className={`swatch swatch--link ${i === 0 ? 'is-on' : ''}`} style={{ background: c, width: 32, height: 32 }} aria-label={`Brand colour ${c}`} />
                ))}
              </div>
              <span className="field__hint">Status colours (available, on hold, booked, sold) stay fixed so buyers read them the same on every developer’s site.</span>
            </div>
            <div className="field">
              <label htmlFor="st-domain" className="field__label">
                Domain
              </label>
              <input id="st-domain" className="input" defaultValue="saffronresidencia.pk" style={{ maxWidth: 360 }} />
            </div>
            <label className="check">
              <input type="checkbox" defaultChecked /> Hide prices of sold units
            </label>
            <label className="check">
              <input type="checkbox" defaultChecked /> Show “On hold” without the agent’s name
            </label>
          </div>
        </section>

        <section id="billing" hidden={active !== 'billing'} aria-labelledby="h-bill" className="panel panel--clip">
          <div className="panel__head">
            <h2 id="h-bill" className="panel__title">
              Billing
            </h2>
          </div>
          <dl className="dl" style={{ padding: 16, gridTemplateColumns: '160px 1fr', fontSize: 14 }}>
            <dt>Plan</dt>
            <dd className="strong">Developer · 25 seats</dd>
            <dt>Seats used</dt>
            <dd>18 of 25 (dealers count as 1 seat per firm)</dd>
            <dt>Next invoice</dt>
            <dd>1 Dec 2026 · [YOUR PRICE]</dd>
            <dt>Paid by</dt>
            <dd>Bank transfer · accounts@saffrondev.pk</dd>
          </dl>
        </section>
      </div>
    </>
  );
}
