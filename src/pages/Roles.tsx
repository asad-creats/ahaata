import { AppSideNav } from '../components/AppSideNav';
import type { Role } from '../lib/session';
import { RefPage } from './RefPage';

const ROLES: { key: Role; active: string; title: string; who: string; land: string; scope: string }[] = [
  { key: 'admin', active: 'dashboard', title: 'Owner / Admin', who: 'Sana Malik', land: 'Dashboard', scope: 'All projects, all records, settings, audit log' },
  { key: 'manager', active: 'myday', title: 'Sales Manager', who: 'Ayesha Khan', land: 'Team today', scope: 'Own team’s leads (9 agents + 4 dealers), insights' },
  { key: 'agent', active: 'myday', title: 'Agent', who: 'Usman Tariq', land: 'My day', scope: 'Own leads; inventory read + hold; own bookings' },
  { key: 'dealer', active: 'referrals', title: 'Dealer (external)', who: 'Al-Noor Estate', land: 'My referrals', scope: 'Leads they submitted; availability without prices of held units' },
  { key: 'finance', active: 'instalments', title: 'Finance', who: 'Rashid Mahmood', land: 'Instalments due', scope: 'Bookings, schedules, receipts; no pipeline' },
];

type C = { t: string; k?: 'part' | 'none' };
const full = (t: string): C => ({ t });
const part = (t: string): C => ({ t, k: 'part' });
const none = (t = 'Hidden'): C => ({ t, k: 'none' });

const MATRIX: { f: string; v: C[] }[] = [
  { f: 'Name, stage, unit', v: [full('Yes'), full('Team'), full('Own'), full('Own referrals'), part('Booked only')] },
  { f: 'Phone, CNIC', v: [full('Yes'), full('Team'), full('Own'), part('Own, masked after booking'), full('Booked buyers')] },
  { f: 'Activity timeline', v: [full('Yes'), full('Team'), full('Own'), part('Stage changes only'), none()] },
  { f: 'Reassign', v: [full('Yes'), full('Within team'), none('Disabled + tooltip'), none('Disabled + tooltip'), none()] },
  { f: 'Move to Token / Booking', v: [full('Yes'), full('Yes'), full('Yes (own)'), none('Request only'), part('Confirms payment')] },
  { f: 'Discount above 2%', v: [full('Approve'), full('Approve up to 5%'), part('Request'), none(), none()] },
  { f: 'Delete / merge duplicates', v: [full('Yes'), part('Merge only'), none('Disabled + tooltip'), none(), none()] },
];

export function Roles() {
  return (
    <RefPage title="Roles — what each person sees" sub="Same shell, same components. Role decides navigation, landing screen and the rows a query can return (scope is enforced on the server, not just hidden in the UI).">
      <div className="roles-grid">
        {ROLES.map((r) => (
          <div key={r.key} className="stack-2 min0" style={{ gap: 10 }}>
            <div className="col" style={{ gap: 2 }}>
              <b className="t-h3">{r.title}</b>
              <span className="small muted">{r.who}</span>
            </div>
            <div className="panel panel--clip" style={{ height: 520, display: 'flex' }}>
              <AppSideNav role={r.key} active={r.active} embedded />
            </div>
            <div className="stack-1 small">
              <span>
                <span className="muted">Lands on</span> <b>{r.land}</b>
              </span>
              <span>
                <span className="muted">Data scope</span> {r.scope}
              </span>
            </div>
          </div>
        ))}
      </div>
      <section aria-labelledby="h-rec" className="panel panel--clip">
        <div className="panel__head">
          <h2 id="h-rec" className="panel__title">
            On a Lead record
          </h2>
        </div>
        <div className="table-scroll">
          <table className="dt" style={{ fontSize: 13, minWidth: 900 }}>
            <thead>
              <tr>
                <th>Field / action</th>
                {['Owner/Admin', 'Sales Manager', 'Agent', 'Dealer', 'Finance'].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((m) => (
                <tr key={m.f}>
                  <td className="strong">{m.f}</td>
                  {m.v.map((c, i) => (
                    <td key={i} style={{ color: c.k === 'part' ? 'var(--warning)' : c.k === 'none' ? 'var(--text-disabled)' : undefined }}>
                      {c.t}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </RefPage>
  );
}
