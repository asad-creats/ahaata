import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { LogCallForm } from '../components/LogCall';
import { Drawer, Track, UnitTag, toneFg, type Tone } from '../components/ui';
import { AWAITING, CALLS, HOLDS, OVERDUE, VISITS, type CallRow } from '../data/agent';
import { useSession } from '../lib/session';
import { useToast } from '../lib/toast';

type Queue = 'call' | 'overdue' | 'visits' | 'awaiting';

let slaToastShown = false;

/** A calm list row: who, why now, how urgent, one main action. */
function Row({ title, sub, chip, tone, action }: { title: ReactNode; sub: string; chip?: string; tone?: Tone; action: ReactNode }) {
  return (
    <li className="home-row">
      <div className="col spacer min0" style={{ gap: 2 }}>
        <span className="strong ellipsis">{title}</span>
        <span className="small muted ellipsis">{sub}</span>
      </div>
      {chip && (
        <span className="home-chip" style={{ color: toneFg(tone ?? 'neutral') }}>
          <Icon name={tone === 'bad' ? 'warn' : 'clock'} size={12} stroke={2.5} />
          {chip}
        </span>
      )}
      {action}
    </li>
  );
}

export function AgentHome() {
  const s = useSession();
  const toast = useToast();
  const [queue, setQueue] = useState<Queue>('call');
  const [logFor, setLogFor] = useState<CallRow | null>(null);
  const [called, setCalled] = useState<string[]>([]);
  const team = s.role !== 'agent';
  const first = s.person.name.split(' ')[0];

  // At T-5 min an in-app toast fires with a Call button.
  useEffect(() => {
    if (slaToastShown) return;
    slaToastShown = true;
    const t = window.setTimeout(() => {
      toast({
        tone: 'alert',
        text: (
          <>
            <b>SLA in 4 min</b> · Kamran Javed (Graana) not yet called
          </>
        ),
        action: { label: 'Call', onClick: () => setLogFor(CALLS[2]) },
      });
    }, 1200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const calls = CALLS.filter((c) => !called.includes(c.name));
  const next = calls[0];
  const rest = calls.slice(1);

  const QUEUES: { key: Queue; label: string; n: number; alert?: boolean }[] = [
    { key: 'call', label: 'Call now', n: 7 - called.length, alert: true },
    { key: 'overdue', label: 'Overdue', n: OVERDUE.length, alert: true },
    { key: 'visits', label: 'Visits', n: VISITS.length },
    { key: 'awaiting', label: 'Awaiting reply', n: AWAITING.length },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const callBtn = (c: CallRow) => (
    <button type="button" className="btn btn--secondary btn--sm" onClick={() => setLogFor(c)}>
      <Icon name="phone" size={14} />
      Call
    </button>
  );

  return (
    <div className="home">
      <header className="home-head">
        <div className="col" style={{ gap: 4 }}>
          <h1 className="home-greet">
            {greeting}, {first}
          </h1>
          <span className="muted">
            {team ? 'Your team today' : 'Here’s your day'} · Tuesday 3 November · {s.project}
          </span>
        </div>
        <div className="row">
          <button type="button" className="btn btn--secondary btn--sm">
            Log activity
          </button>
          <button type="button" className="btn btn--primary btn--sm">
            Add lead
          </button>
        </div>
      </header>

      {next && (
        <section className="home-next" aria-labelledby="h-next">
          <span className="home-next__eyebrow" id="h-next">
            Next up
          </span>
          <div className="home-next__body">
            <div className="col min0" style={{ gap: 6, flex: 1 }}>
              <Link to="/leads/L-20931" className="home-next__name">
                {next.name}
              </Link>
              <span className="text-2">
                {next.why} · {next.source}
              </span>
              <span className="row-wrap" style={{ gap: 8 }}>
                <UnitTag>{next.unit}</UnitTag>
                <span className="small muted">{next.budget}</span>
                <span className="home-chip" style={{ color: toneFg(next.tone) }}>
                  <Icon name={next.tone === 'bad' ? 'warn' : 'clock'} size={12} stroke={2.5} />
                  {next.sla}
                </span>
              </span>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button type="button" className="btn btn--secondary btn--lg btn--icon" style={{ width: 40 }} aria-label={`WhatsApp ${next.name}`}>
                <Icon name="whatsapp" size={16} stroke={1.8} />
              </button>
              <button type="button" className="btn btn--primary btn--lg" data-tour="call-first" onClick={() => setLogFor(next)}>
                <Icon name="phone" size={16} />
                Call {next.name.split(' ')[0]}
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="home-grid">
        <section className="panel panel--clip" aria-label="Today's queues">
          <div role="tablist" aria-label="Today's queues" className="home-pills">
            {QUEUES.map((q) => (
              <button key={q.key} type="button" role="tab" aria-selected={queue === q.key} className="home-pill" data-tour={`tile-${q.key}`} onClick={() => setQueue(q.key)}>
                {q.label}
                <span className={`home-pill__n ${q.alert && q.n > 0 ? 'is-alert' : ''}`}>{q.n}</span>
              </button>
            ))}
          </div>

          <ul className="home-list">
            {queue === 'call' &&
              (rest.length ? (
                rest.map((c) => (
                  <Row
                    key={c.name}
                    title={
                      <Link to="/leads/L-20931" className="cell-link">
                        {c.name}
                      </Link>
                    }
                    sub={`${c.why} · ${c.unit}`}
                    chip={c.sla}
                    tone={c.tone}
                    action={callBtn(c)}
                  />
                ))
              ) : (
                <li className="home-row muted">Nothing else waiting. New leads land here within a minute.</li>
              ))}
            {queue === 'overdue' &&
              OVERDUE.map((o) => (
                <Row
                  key={o.name}
                  title={o.name}
                  sub={`${o.stage} · “${o.note}”`}
                  chip={o.late}
                  tone="bad"
                  action={
                    <span className="row" style={{ gap: 6 }}>
                      <button type="button" className="btn btn--ghost btn--sm">
                        Reschedule
                      </button>
                      {callBtn({ ...CALLS[0], name: o.name, phone: '0300 512 3478' })}
                    </span>
                  }
                />
              ))}
            {queue === 'visits' &&
              VISITS.map((v) => (
                <Row
                  key={v.time}
                  title={`${v.time} · ${v.name}`}
                  sub={v.what}
                  chip={v.status}
                  tone={v.tone}
                  action={
                    <button type="button" className="btn btn--secondary btn--sm">
                      Log visit
                    </button>
                  }
                />
              ))}
            {queue === 'awaiting' &&
              AWAITING.map((a) => (
                <Row
                  key={a.name}
                  title={a.name}
                  sub={`${a.what} · ${a.seen}`}
                  action={
                    <button type="button" className="btn btn--secondary btn--sm">
                      Nudge on WhatsApp
                    </button>
                  }
                />
              ))}
          </ul>
          {queue === 'call' && <div className="panel__foot">Sorted by time left to respond · new leads 15 min, follow-ups 24h</div>}
        </section>

        <aside className="panel home-side" aria-label="Today at a glance">
          <h2 className="panel__title">At a glance</h2>
          <div className="stack-2">
            <span className="t-label">Next visit</span>
            <span>
              <b>{VISITS[0].time}</b> · {VISITS[0].name}
            </span>
            <span className="small" style={{ color: toneFg(VISITS[0].tone) }}>
              {VISITS[0].status}
            </span>
          </div>
          <div className="stack-2">
            <span className="t-label">Holds expiring</span>
            {HOLDS.map((h) => (
              <div key={h.unit} className="row">
                <UnitTag>{h.unit}</UnitTag>
                <span className="small text-2 spacer">{h.for}</span>
                <span className="small bold" style={{ color: toneFg(h.tone) }}>
                  {h.left}
                </span>
              </div>
            ))}
          </div>
          <div className="stack-2">
            <span className="t-label">This month</span>
            <div className="row small" style={{ justifyContent: 'space-between' }}>
              <span className="muted">Bookings</span>
              <b>3 of 5</b>
            </div>
            <Track pct={60} label="Bookings 3 of 5" />
            <div className="row small" style={{ justifyContent: 'space-between' }}>
              <span className="muted">Site visits</span>
              <b>14 of 20</b>
            </div>
            <Track pct={70} label="Site visits 14 of 20" />
          </div>
        </aside>
      </div>

      {logFor && (
        <Drawer title="Log call" sub={`${logFor.name} · ${logFor.phone}`} onClose={() => setLogFor(null)}>
          <LogCallForm
            name={logFor.name}
            meta={`Outgoing · dialled ${logFor.phone} · just now`}
            onSave={(outcome) => {
              const name = logFor.name;
              setCalled((xs) => [...xs, name]);
              setLogFor(null);
              toast({ text: `Call with ${name} logged · ${outcome}`, action: { label: 'Undo', onClick: () => setCalled((xs) => xs.filter((x) => x !== name)) } });
            }}
          />
        </Drawer>
      )}
    </div>
  );
}
