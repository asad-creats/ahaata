import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { LogCallForm } from '../components/LogCall';
import { Drawer, Panel, Track, UnitTag, toneBar, toneFg, type Tone } from '../components/ui';
import { AWAITING, CALLS, HOLDS, OVERDUE, VISITS, type CallRow } from '../data/agent';
import { useSession } from '../lib/session';
import { useToast } from '../lib/toast';

type Queue = 'call' | 'overdue' | 'visits' | 'awaiting';

const TILES: { key: Queue; label: string; n: string; sub: string; tone: Tone }[] = [
  { key: 'call', label: 'Call now', n: '7', sub: '2 breached', tone: 'bad' },
  { key: 'overdue', label: 'Overdue follow-ups', n: '4', sub: 'oldest 6d', tone: 'bad' },
  { key: 'visits', label: 'Site visits today', n: '2', sub: 'next 11:00', tone: 'neutral' },
  { key: 'awaiting', label: 'Awaiting reply', n: '3', sub: 'payment plans sent', tone: 'neutral' },
];

let slaToastShown = false;

export function AgentHome() {
  const s = useSession();
  const toast = useToast();
  const [queue, setQueue] = useState<Queue>('call');
  const [logFor, setLogFor] = useState<CallRow | null>(null);
  const [called, setCalled] = useState<string[]>([]);
  const team = s.role !== 'agent';

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

  const pick = (q: Queue) => {
    // Tiles act as tabs: one queue at a time keeps the page calm.
    setQueue(q);
  };

  const calls = CALLS.filter((c) => !called.includes(c.name));

  return (
    <>
      <div className="page-head page-head--end">
        <div className="spacer" style={{ minWidth: 280 }}>
          <h1 className="t-h1">{team ? 'Team today' : 'My day'}</h1>
          <span className="muted">Tuesday 3 November · {s.project} · shift ends 19:00</span>
        </div>
        <button type="button" className="btn btn--secondary">
          Log activity
        </button>
        <button type="button" className="btn btn--primary">
          Add lead
        </button>
      </div>

      <div role="tablist" aria-label="Today's queues" className="grid-tiles grid-tiles--4">
        {TILES.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={queue === t.key} className="kpi" data-tour={`tile-${t.key}`} onClick={() => pick(t.key)}>
            <span className="kpi__label">{t.label}</span>
            <span className="row" style={{ alignItems: 'baseline' }}>
              <span className="kpi__value">{t.key === 'call' ? Number(t.n) - called.length : t.n}</span>
              <span className="kpi__sub" style={{ color: toneFg(t.tone) }}>
                {t.sub}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="split split--24">
        <div className="stack-6 min0" style={{ flex: '999 1 640px' }}>
          {queue === 'awaiting' && (
            <Panel title="Awaiting reply" titleId="q-awaiting" meta={<span className="small muted">Payment plans sent, no answer yet</span>}>
              {AWAITING.map((a) => (
                <div key={a.name} className="list-row">
                  <span className="col spacer min0">
                    <b className="strong">{a.name}</b>
                    <span className="small muted">{a.what}</span>
                  </span>
                  <span className="small text-2">{a.seen}</span>
                  <button type="button" className="btn btn--secondary btn--sm">
                    Nudge on WhatsApp
                  </button>
                </div>
              ))}
            </Panel>
          )}

          {queue === 'call' && (
          <section id="q-call" aria-labelledby="h-call" className="panel panel--clip">
            <div className="panel__head">
              <h2 id="h-call" className="panel__title">
                Call now
              </h2>
              <span className="small muted">Sorted by SLA remaining · first-contact SLA 15 min, follow-up SLA 24h</span>
              <span className="spacer" />
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => calls[0] && setLogFor(calls[0])}>
                Start calling session
              </button>
            </div>
            <div className="table-scroll">
              <table className="dt dt--roomy" style={{ minWidth: 760 }}>
                <colgroup>
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '22%' }} />
                  <col style={{ width: '20%' }} />
                  <col style={{ width: '18%' }} />
                  <col style={{ width: 140 }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Why now</th>
                    <th>Interest</th>
                    <th>SLA</th>
                    <th style={{ width: 140 }}>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {calls.map((c) => (
                    <tr key={c.name} className={c.tone === 'bad' ? 'is-risk' : undefined}>
                      <td>
                        <span className="cell-stack">
                          <Link to="/leads/L-20931" className="cell-link ellipsis" title={c.name} style={{ maxWidth: 200 }}>
                            {c.name}
                          </Link>
                          <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="small muted" style={{ textDecoration: 'none' }} onClick={() => setLogFor(c)}>
                            {c.phone}
                          </a>
                        </span>
                      </td>
                      <td>
                        <span className="cell-stack">
                          <span>{c.why}</span>
                          <span className="small muted">{c.source}</span>
                        </span>
                      </td>
                      <td>
                        <span className="row-wrap" style={{ gap: 6 }}>
                          <UnitTag>{c.unit}</UnitTag>
                          <span className="small muted">{c.budget}</span>
                        </span>
                      </td>
                      <td>
                        <span className="stack-1">
                          <span className="row small strong" style={{ gap: 4, color: toneFg(c.tone) }}>
                            <Icon name={c.tone === 'bad' ? 'warn' : 'clock'} size={12} stroke={2.5} />
                            {c.sla}
                          </span>
                          <Track h={4} pct={c.pct} color={toneBar(c.tone)} />
                        </span>
                      </td>
                      <td>
                        <span className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                          <button type="button" className="btn btn--secondary btn--icon" aria-label={`WhatsApp ${c.name}`}>
                            <Icon name="whatsapp" size={16} stroke={1.8} />
                          </button>
                          <button type="button" className="btn btn--primary btn--sm" style={{ height: 36 }} data-tour={c === calls[0] ? 'call-first' : undefined} onClick={() => setLogFor(c)}>
                            <Icon name="phone" size={14} />
                            Call
                          </button>
                        </span>
                      </td>
                    </tr>
                  ))}
                  {calls.length === 0 && (
                    <tr>
                      <td colSpan={5} className="muted" style={{ padding: 24 }}>
                        Queue clear. New leads land here within a minute and the SLA timer starts.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
          )}

          {queue === 'overdue' && (
          <Panel
            title="Overdue follow-ups"
            titleId="q-overdue"
            meta={<span className="count count--alert">{OVERDUE.length}</span>}
            actions={
              <Link to="/leads" className="strong">
                Open in table
              </Link>
            }
          >
            {OVERDUE.map((o) => (
              <div key={o.name} className="list-row" style={{ flexWrap: 'wrap', gap: 16 }}>
                <span className="row small bold danger-text" style={{ width: 64, gap: 4 }}>
                  <Icon name="warn" size={12} stroke={2.5} />
                  {o.late}
                </span>
                <span className="col spacer" style={{ minWidth: 240 }}>
                  <span>
                    <b className="strong">{o.name}</b> · {o.stage}
                  </span>
                  <span className="small muted">
                    Last note: “{o.note}” — {o.by}
                  </span>
                </span>
                <button type="button" className="btn btn--secondary btn--sm">
                  Reschedule
                </button>
                <button type="button" className="btn btn--primary btn--sm" onClick={() => setLogFor({ ...CALLS[0], name: o.name, phone: '0300 512 3478' })}>
                  Call
                </button>
              </div>
            ))}
          </Panel>
          )}
          {queue === 'visits' && (
          <Panel title="Site visits today" titleId="q-visits" actions={<span className="small muted">{VISITS.length}</span>}>
            {VISITS.map((v) => (
              <div key={v.time} className="list-row" style={{ alignItems: 'flex-start' }}>
                <span className="bold" style={{ width: 48 }}>
                  {v.time}
                </span>
                <span className="stack-1 spacer min0">
                  <b className="strong">{v.name}</b>
                  <span className="small muted">{v.what}</span>
                  <span className="small strong" style={{ color: toneFg(v.tone) }}>
                    {v.status}
                  </span>
                </span>
              </div>
            ))}
            <div style={{ padding: '12px 16px' }}>
              <button type="button" className="btn btn--ghost btn--sm">
                Log a visit
              </button>
            </div>
          </Panel>
          )}
        </div>

        <aside className="stack-6 min0" style={{ flex: '1 1 320px' }}>
          <Panel title="Holds expiring">
            {HOLDS.map((h) => (
              <div key={h.unit} className="list-row">
                <UnitTag>{h.unit}</UnitTag>
                <span className="spacer small text-2">for {h.for}</span>
                <span className="small bold" style={{ color: toneFg(h.tone) }}>
                  {h.left}
                </span>
              </div>
            ))}
          </Panel>

          <section aria-labelledby="h-mine" className="panel stack-2" style={{ padding: '12px 16px' }}>
            <h2 id="h-mine" className="panel__title">
              This month vs target
            </h2>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="muted">Bookings</span>
              <b>3 of 5</b>
            </div>
            <Track pct={60} label="Bookings 3 of 5" />
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="muted">Site visits</span>
              <b>14 of 20</b>
            </div>
            <Track pct={70} label="Site visits 14 of 20" />
          </section>
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
    </>
  );
}
