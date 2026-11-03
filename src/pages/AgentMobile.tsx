import { useRef, useState, type PointerEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icon, type IconName } from '../components/Icon';
import { LogCallForm } from '../components/LogCall';
import { Sheet, StageBadge, toneFg, type Tone } from '../components/ui';
import { useToast } from '../lib/toast';

const CALLS: { name: string; why: string; sla: string; tone: Tone }[] = [
  { name: 'Bilal Hussain', why: 'New · Facebook · 2-bed, PKR 1.5–1.9 Cr', sla: 'Breached 17 min', tone: 'bad' },
  { name: 'Sadia Rehman', why: 'Hold A-1203 expires in 1h', sla: 'Breached 2 min', tone: 'bad' },
  { name: 'Kamran Javed', why: 'New · Graana · Studio, PKR 85 lakh', sla: '4 min left', tone: 'warn' },
  { name: 'Hina Aslam', why: 'Callback requested 12:30 · C-1102', sla: '1h 20m left', tone: 'ok' },
  { name: 'Zubair Qureshi', why: 'Opened payment plan twice · B-702', sla: '3h 05m left', tone: 'ok' },
  { name: 'Mariam Saleem Chaudhry-Abbasi', why: 'Re-enquired after 40 days · 3-bed', sla: '5h 40m left', tone: 'ok' },
];

const OVERDUE = [
  { name: 'Faraz Ahmed', why: 'Negotiation · Wants 5% off on B-504', sla: '6d late', tone: 'bad' as Tone },
  { name: 'Nadia Farooq', why: 'Payment plan shared · 4-year plan?', sla: '3d late', tone: 'bad' as Tone },
  { name: 'Imran Shah', why: 'Visit scheduled · rebook', sla: '2d late', tone: 'bad' as Tone },
  { name: 'Tariq Mehmood', why: 'Qualified · send floor plans', sla: '1d late', tone: 'bad' as Tone },
];

const VISITS = [
  { name: 'Ayesha Malik + husband', why: '11:00 · C-1102, B-702 · sample apartment', sla: 'Confirmed', tone: 'ok' as Tone },
  { name: 'Hamza Siddiqui', why: '16:30 · Plot C-114 · 45 min drive', sla: 'Not confirmed', tone: 'warn' as Tone },
];

const ACTS: { icon: IconName; title: string; body: string; meta: string }[] = [
  { icon: 'phone', title: 'Call · 6 min', body: 'Wants 5% off on B-504, will confirm with wife.', meta: 'Usman Tariq · 28 Oct, 17:40' },
  { icon: 'doc', title: 'Payment plan sent', body: 'B-504 · 3-year · 25% down · PKR 1.85 Cr', meta: 'Usman Tariq · 26 Oct, 12:05' },
  { icon: 'pin', title: 'Site visit done', body: 'Saw B-504 and B-702 with family.', meta: 'Usman Tariq · 25 Oct, 11:00' },
  { icon: 'chat', title: 'WhatsApp', body: 'Shared brochure + floor plans.', meta: 'Usman Tariq · 22 Oct, 15:12' },
];

const TABS: { label: string; icon: IconName; to: string }[] = [
  { label: 'My day', icon: 'home', to: '/m' },
  { label: 'Pipeline', icon: 'board', to: '/pipeline' },
  { label: 'Leads', icon: 'list', to: '/leads' },
  { label: 'Inventory', icon: 'grid', to: '/inventory' },
  { label: 'More', icon: 'more', to: '/my-day' },
];

type Q = 'call' | 'overdue' | 'visits';

/** Lead row: swipe right = Call, left = WhatsApp. Both also reachable via buttons. */
function SwipeRow({ name, why, sla, tone, onCall, onWa }: { name: string; why: string; sla: string; tone: Tone; onCall: () => void; onWa: () => void }) {
  const start = useRef<number | null>(null);
  const [dx, setDx] = useState(0);
  const down = (e: PointerEvent) => {
    if ((e.target as HTMLElement).closest('button, a')) return;
    start.current = e.clientX;
  };
  const move = (e: PointerEvent) => start.current !== null && setDx(Math.max(-96, Math.min(96, e.clientX - start.current)));
  const up = () => {
    if (dx > 72) onCall();
    else if (dx < -72) onWa();
    start.current = null;
    setDx(0);
  };
  return (
    <div className="m-swipe">
      <div className="m-swipe__under" aria-hidden="true">
        <span className="row" style={{ gap: 6, opacity: dx > 0 ? 1 : 0 }}>
          <Icon name="phone" /> Call
        </span>
        <span className="row" style={{ gap: 6, opacity: dx < 0 ? 1 : 0 }}>
          WhatsApp <Icon name="chat" />
        </span>
      </div>
      <div
        className="m-row"
        style={{ transform: `translateX(${dx}px)`, background: tone === 'bad' ? 'var(--danger-row)' : 'var(--surface)' }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <div className="col spacer min0" style={{ gap: 2 }}>
          <Link to="/m/lead" className="cell-link ellipsis">
            {name}
          </Link>
          <span className="small muted ellipsis">{why}</span>
          <span className="row small bold" style={{ gap: 4, color: toneFg(tone) }}>
            <Icon name={tone === 'bad' ? 'warn' : 'clock'} size={12} stroke={2.5} />
            {sla}
          </span>
        </div>
        <button type="button" className="btn btn--secondary" style={{ width: 44, height: 44, padding: 0 }} aria-label={`WhatsApp ${name}`} onClick={onWa}>
          <Icon name="chat" size={18} stroke={1.8} />
        </button>
        <button type="button" className="btn btn--primary" style={{ width: 44, height: 44, padding: 0 }} aria-label={`Call ${name}`} onClick={onCall}>
          <Icon name="phone" size={18} />
        </button>
      </div>
    </div>
  );
}

export function AgentMobile() {
  const { view } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const [q, setQ] = useState<Q>('call');
  const [logFor, setLogFor] = useState<string | null>(view === 'log' ? 'Faraz Ahmed' : null);

  const list = q === 'call' ? CALLS : q === 'overdue' ? OVERDUE : VISITS;

  return (
    <div className="m-stage">
      <div className="m-phone">
        {view === 'lead' ? (
          <>
            <div className="m-lead-head">
              <div className="row">
                <button type="button" className="btn btn--ghost btn--icon" style={{ marginLeft: -8, width: 40, height: 40, color: 'var(--text)' }} aria-label="Back" onClick={() => nav('/m')}>
                  <Icon name="chevronLeft" size={20} />
                </button>
                <span className="spacer" />
                <button type="button" className="btn btn--ghost btn--icon" style={{ width: 40, height: 40, color: 'var(--text)' }} aria-label="More actions">
                  ⋯
                </button>
              </div>
              <div className="stack-1">
                <span className="t-h2">Faraz Ahmed</span>
                <span className="small muted">0300 512 3478 · Facebook · Owner: Usman Tariq</span>
                <span style={{ marginTop: 4 }}>
                  <StageBadge stage="Negotiation" age="12d" state="r" />
                </span>
              </div>
              <div className="m-actions">
                <button type="button" className="btn btn--primary" onClick={() => setLogFor('Faraz Ahmed')}>
                  <Icon name="phone" size={18} />
                  Call
                </button>
                <button type="button" className="btn btn--secondary">
                  <Icon name="chat" size={18} stroke={1.8} />
                  WhatsApp
                </button>
                <button type="button" className="btn btn--secondary">
                  <Icon name="pin" size={18} stroke={1.8} />
                  Visit
                </button>
                <button type="button" className="btn btn--secondary">
                  <Icon name="doc" size={18} stroke={1.8} />
                  Plan
                </button>
              </div>
            </div>
            <div className="stack-3 m-scroll" style={{ padding: 16 }}>
              <div className="panel stack-2" style={{ padding: 12 }}>
                <span className="t-label">Units of interest</span>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span>
                    <b>B-504</b> · 2-bed · 1,150 sq ft
                  </span>
                  <span className="small strong warning-text">Quoted · on hold</span>
                </div>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span>
                    <b>B-702</b> · 2-bed · 1,150 sq ft
                  </span>
                  <span className="small muted">Visited</span>
                </div>
              </div>
              <div className="t-label">Activity</div>
              {ACTS.map((a) => (
                <div key={a.title} className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
                  <span className="timeline__icon" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <Icon name={a.icon} size={14} />
                  </span>
                  <div className="col min0">
                    <span className="strong">{a.title}</span>
                    <span className="small text-2">{a.body}</span>
                    <span className="small muted">{a.meta}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="m-head">
              <div className="row">
                <button type="button" className="topbar__btn topbar__btn--fill" style={{ height: 40, maxWidth: 220 }}>
                  <span className="ellipsis strong">Saffron Residencia</span>
                  <Icon name="chevronDown" size={14} color="var(--on-brand-muted)" />
                </button>
                <span className="spacer" />
                <button type="button" className="topbar__icon" aria-label="Search">
                  <Icon name="search" size={20} />
                </button>
                <button type="button" className="topbar__icon" aria-label="Notifications, 3 unread">
                  <Icon name="bell" size={20} stroke={1.8} />
                  <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, background: 'var(--accent-500)' }} />
                </button>
              </div>
              <div>
                <div className="t-h2">My day</div>
                <div className="small" style={{ color: 'var(--on-brand-muted)' }}>
                  Tue 3 Nov · 7 to call · 4 overdue · 2 visits
                </div>
              </div>
            </div>
            <div role="tablist" className="m-pills">
              {(
                [
                  ['call', 'Call now 7'],
                  ['overdue', `Overdue ${OVERDUE.length}`],
                  ['visits', `Visits ${VISITS.length}`],
                ] as [Q, string][]
              ).map(([k, l]) => (
                <button key={k} type="button" role="tab" aria-selected={q === k} className="m-pill" onClick={() => setQ(k)}>
                  {l}
                </button>
              ))}
            </div>
            <div className="m-scroll">
              {list.map((c) => (
                <SwipeRow key={c.name} {...c} onCall={() => setLogFor(c.name)} onWa={() => toast({ text: `Opening WhatsApp for ${c.name}` })} />
              ))}
              <p className="small muted" style={{ padding: '12px 16px', margin: 0 }}>
                Swipe a row right to call, left to WhatsApp.
              </p>
            </div>
          </>
        )}
        <nav aria-label="Main" className="m-tabs">
          {TABS.map((t, i) => (
            <Link key={t.label} to={t.to} className="bottom-tabs__item" aria-current={i === 0 && view !== 'lead' ? 'page' : undefined}>
              <Icon name={t.icon} size={20} stroke={t.icon === 'more' ? 2.5 : 1.8} />
              {t.label}
            </Link>
          ))}
        </nav>
      </div>

      {logFor && (
        <Sheet label={`Log call with ${logFor}`} onClose={() => setLogFor(null)}>
          <LogCallForm
            large
            name={logFor}
            meta="Outgoing · 4m 12s · 10:14"
            onSave={(o) => {
              toast({ text: `Call with ${logFor} saved · ${o}. Syncs when online.` });
              setLogFor(null);
              if (view === 'log') nav('/m');
            }}
          />
        </Sheet>
      )}
    </div>
  );
}
