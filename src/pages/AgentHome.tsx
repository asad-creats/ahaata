import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { LogCallForm } from '../components/LogCall';
import { Drawer, Track, UnitTag, type Tone } from '../components/ui';
import { AWAITING, CALLS, HOLDS, OVERDUE, VISITS, type CallRow } from '../data/agent';
import { leadPath } from '../lib/leadLink';
import { useSession } from '../lib/session';
import { useToast } from '../lib/toast';

type Queue = 'call' | 'overdue' | 'visits' | 'awaiting';

let slaToastShown = false;

/** "Breached by 17 min" → "17 min late", "4 min left" → "within 4 min". */
function dueText(sla: string) {
  const late = /^Breached by (.+)$/.exec(sla);
  if (late) return `${late[1]} late`;
  const left = /^(.+) left$/.exec(sla);
  return left ? `within ${left[1]}` : sla;
}

/** "6d late" → "6 days late". */
const lateText = (s: string) => s.replace(/^(\d+)d late$/, (_, n) => `${n} ${n === '1' ? 'day' : 'days'} late`);

/** "B-702 · 3-year plan sent 1 Nov" → "Sent the 3-year plan for B-702 on 1 Nov". */
function sentText(what: string) {
  const [unit, rest = ''] = what.split(' · ');
  const m = /^(.+) sent (.+)$/.exec(rest);
  return m ? `Sent the ${m[1]} for ${unit} on ${m[2]}` : what;
}

function Due({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`due due--${tone}`}>{children}</span>
  );
}

/** One person per row: who, why in plain words, when, one main action. */
function Row({ title, say, note, due, action }: { title: ReactNode; say: ReactNode; note?: ReactNode; due?: ReactNode; action: ReactNode }) {
  return (
    <li className="home-row">
      <div className="home-row__main">
        <span className="home-row__name">{title}</span>
        <span className="home-row__say">{say}</span>
        {note && <span className="home-row__note">{note}</span>}
      </div>
      <div className="home-row__side">
        {due}
        {action}
      </div>
    </li>
  );
}

const GROUPS: { tone: Tone; title: string }[] = [
  { tone: 'bad', title: 'Late' },
  { tone: 'warn', title: 'Due soon' },
  { tone: 'ok', title: 'Later today' },
];

export function AgentHome() {
  const s = useSession();
  const toast = useToast();
  const [queue, setQueue] = useState<Queue>('call');
  const [logFor, setLogFor] = useState<CallRow | null>(null);
  const [called, setCalled] = useState<string[]>([]);
  const listRef = useRef<HTMLElement>(null);
  const team = s.role !== 'agent';
  const first = s.person.name.split(' ')[0];

  // A few minutes before a new lead goes late, a toast offers the call.
  useEffect(() => {
    if (slaToastShown) return;
    slaToastShown = true;
    const t = window.setTimeout(() => {
      toast({
        tone: 'alert',
        text: (
          <>
            <b>Call Kamran Javed in the next 4 min</b> · new enquiry from Graana
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
  const lateCalls = calls.filter((c) => c.tone === 'bad').length;

  const QUEUES: { key: Queue; label: string; n: number; alert?: boolean }[] = [
    { key: 'call', label: 'To call', n: calls.length, alert: lateCalls > 0 },
    { key: 'overdue', label: 'Late follow-ups', n: OVERDUE.length, alert: true },
    { key: 'visits', label: 'Visits today', n: VISITS.length },
    { key: 'awaiting', label: 'Waiting on buyer', n: AWAITING.length },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const open = (q: Queue) => {
    setQueue(q);
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const callBtn = (c: CallRow, label = 'Call') => (
    <button type="button" className="btn btn--secondary btn--sm" onClick={() => setLogFor(c)}>
      <Icon name="phone" size={14} />
      {label}
    </button>
  );

  const nameLink = (name: string) => (
    <Link to={leadPath(name)} className="cell-link">
      {name}
    </Link>
  );

  return (
    <div className="home">
      <header className="home-head">
        <div className="col" style={{ gap: 6 }}>
          <span className="muted small">
            {team ? 'Your team today' : 'Your day'} · Tuesday 3 November · {s.project}
          </span>
          <h1 className="home-greet">
            {greeting}, {first}
          </h1>
          <p className="home-summary">
            You have{' '}
            <button type="button" className="home-summary__link" onClick={() => open('call')}>
              {calls.length} people to call
            </button>
            {lateCalls > 0 && <span className="danger-text"> ({lateCalls} already late)</span>},{' '}
            <button type="button" className="home-summary__link" onClick={() => open('overdue')}>
              {OVERDUE.length} follow-ups past their date
            </button>{' '}
            and{' '}
            <span style={{ whiteSpace: 'nowrap' }}>
              <button type="button" className="home-summary__link" onClick={() => open('visits')}>
                {VISITS.length} site visits
              </button>
              .
            </span>
          </p>
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
          <div className="home-next__top">
            <span className="home-next__eyebrow" id="h-next">
              Call first
            </span>
            <span className="muted">·</span>
            <Due tone={next.tone}>{dueText(next.sla)}</Due>
          </div>
          <div className="home-next__body">
            <div className="col min0" style={{ gap: 6, flex: 1 }}>
              <Link to={leadPath(next.name)} className="home-next__name">
                {next.name}
              </Link>
              <span className="home-next__say">{next.say ?? next.why}</span>
              <span className="home-next__facts">
                Looking for <b>{next.unit}</b> · Budget <b>{next.budget}</b>
              </span>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button type="button" className="btn btn--secondary btn--lg" aria-label={`WhatsApp ${next.name}`}>
                <Icon name="whatsapp" size={16} stroke={1.8} />
                <span className="hide-sm">WhatsApp</span>
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
        <section className="panel panel--clip home-queue" aria-label="Today's work" ref={listRef}>
          <div role="tablist" aria-label="Today's work" className="home-pills">
            {QUEUES.map((q) => (
              <button key={q.key} type="button" role="tab" aria-selected={queue === q.key} className="home-pill" data-tour={`tile-${q.key}`} onClick={() => setQueue(q.key)}>
                {q.label}
                <span className={`home-pill__n ${q.alert && q.n > 0 ? 'is-alert' : ''}`}>{q.n}</span>
              </button>
            ))}
          </div>

          {queue === 'call' &&
            (rest.length ? (
              GROUPS.map((g) => {
                const rows = rest.filter((c) => c.tone === g.tone);
                if (!rows.length) return null;
                return (
                  <div key={g.tone} className="home-group">
                    <h3 className="home-group__title">{g.title}</h3>
                    <ul className="home-list">
                      {rows.map((c) => (
                        <Row key={c.name} title={nameLink(c.name)} say={c.say ?? c.why} due={<Due tone={c.tone}>{dueText(c.sla)}</Due>} action={callBtn(c)} />
                      ))}
                    </ul>
                  </div>
                );
              })
            ) : (
              <p className="home-empty">Nobody else to call right now. New enquiries show up here within a minute.</p>
            ))}

          {queue === 'overdue' && (
            <ul className="home-list">
              {OVERDUE.map((o) => (
                <Row
                  key={o.name}
                  title={nameLink(o.name)}
                  say={o.note}
                  note={`${o.stage} · follow-up set by ${o.by}`}
                  due={<Due tone="bad">{lateText(o.late)}</Due>}
                  action={
                    <span className="row" style={{ gap: 6 }}>
                      <button type="button" className="btn btn--ghost btn--sm">
                        New date
                      </button>
                      {callBtn({ ...CALLS[0], name: o.name, phone: '0300 512 3478' })}
                    </span>
                  }
                />
              ))}
            </ul>
          )}

          {queue === 'visits' && (
            <ul className="home-list">
              {VISITS.map((v) => (
                <Row
                  key={v.time}
                  title={
                    <>
                      <span className="home-time">{v.time}</span> {v.name}
                    </>
                  }
                  say={v.what}
                  due={<Due tone={v.tone}>{v.status}</Due>}
                  action={
                    <button type="button" className="btn btn--secondary btn--sm">
                      Log visit
                    </button>
                  }
                />
              ))}
            </ul>
          )}

          {queue === 'awaiting' && (
            <ul className="home-list">
              {AWAITING.map((a) => (
                <Row
                  key={a.name}
                  title={nameLink(a.name)}
                  say={sentText(a.what)}
                  due={<Due tone="neutral">{a.seen}</Due>}
                  action={
                    <button type="button" className="btn btn--secondary btn--sm">
                      <Icon name="whatsapp" size={14} />
                      Remind
                    </button>
                  }
                />
              ))}
            </ul>
          )}

          {queue === 'call' && <div className="panel__foot">Whoever needs a call soonest is at the top. Call new enquiries within 15 min and follow-ups within a day.</div>}
        </section>

        <aside className="panel home-side" aria-label="Also today">
          <h2 className="panel__title">Also today</h2>

          <div className="home-side__block">
            <span className="t-label">Next site visit</span>
            <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
              <span className="home-side__time">{VISITS[0].time}</span>
              <span className="col" style={{ gap: 2 }}>
                <b>{VISITS[0].name}</b>
                <span className="small text-2">{VISITS[0].what}</span>
                <span className="small muted">{VISITS[0].status}</span>
              </span>
            </div>
          </div>

          <div className="home-side__block">
            <span className="t-label">Flats on hold for your buyers</span>
            {[...HOLDS]
              .sort((a, b) => (a.tone === 'bad' ? -1 : b.tone === 'bad' ? 1 : 0))
              .map((h) => (
                <div key={h.unit} className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
                  <UnitTag>{h.unit}</UnitTag>
                  <span className="col" style={{ gap: 4 }}>
                    <span className="small">For {h.for}</span>
                    <Due tone={h.tone === 'bad' ? 'bad' : 'neutral'}>Hold ends in {h.left}</Due>
                  </span>
                </div>
              ))}
          </div>

          <div className="home-side__block">
            <span className="t-label">Your month so far</span>
            <div className="row small" style={{ justifyContent: 'space-between' }}>
              <span>Bookings</span>
              <span>
                <b>3</b> <span className="muted">of 5 target</span>
              </span>
            </div>
            <Track pct={60} label="Bookings 3 of 5" />
            <div className="row small" style={{ justifyContent: 'space-between' }}>
              <span>Site visits</span>
              <span>
                <b>14</b> <span className="muted">of 20 target</span>
              </span>
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
