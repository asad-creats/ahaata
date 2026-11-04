import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, type IconName } from '../components/Icon';
import { LogCallForm } from '../components/LogCall';
import { Avatar, Chip, DisabledWhy, Drawer, Modal, Button, StageBadge, UnitTag } from '../components/ui';
import { STAGES } from '../data/pipeline';
import { useSession } from '../lib/session';
import { useToast } from '../lib/toast';

type Section = 'activity' | 'units' | 'history';
type Kind = 'all' | 'call' | 'wa' | 'visit' | 'note';
type Act = { kind: Kind | 'sys' | 'doc'; icon: IconName; title: string; meta: string; body: string; tone?: 'bad' | 'brand' };

const ACTS: Act[] = [
  { kind: 'sys', icon: 'sys', title: 'Follow-up missed', meta: 'System · due 29 Oct 11:00', body: 'Agreed call-back to confirm discount did not happen. Manager Ayesha Khan notified.', tone: 'bad' },
  { kind: 'call', icon: 'phone', title: 'Call · 6 min · Interested', meta: 'Usman Tariq · 28 Oct, 17:40', body: 'Wants 5% off on B-504, will confirm with wife. Asked if 4th-floor alternative B-404 is cheaper.' },
  { kind: 'wa', icon: 'chat', title: 'WhatsApp · read', meta: 'Usman Tariq · 27 Oct, 10:02', body: 'Sent revised payment plan (3-year, quarterly) for B-504.' },
  { kind: 'doc', icon: 'doc', title: 'Payment plan shared · opened 3 times', meta: 'Usman Tariq · 26 Oct, 12:05', body: 'B-504 · PKR 1.85 Cr · 25% down (PKR 46.25 lakh) · 12 quarterly instalments of PKR 11.56 lakh.', tone: 'brand' },
  { kind: 'visit', icon: 'pin', title: 'Site visit · 55 min', meta: 'Usman Tariq · 25 Oct, 11:00', body: 'Came with wife and father. Saw B-504 and B-702. Liked B-504 view, concerned about lift count in Tower B.' },
  { kind: 'note', icon: 'note', title: 'Note', meta: 'Ayesha Khan (manager) · 24 Oct', body: '@Usman offer parking spot as sweetener before discount.' },
  { kind: 'call', icon: 'phone', title: 'Call · 3 min · Qualified', meta: 'Usman Tariq · 22 Oct, 21:29', body: 'Budget 1.6–1.9 Cr, family of 5, wants possession within 2 years.' },
  { kind: 'sys', icon: 'sys', title: 'Lead created from Facebook Lead Ads', meta: 'System · 22 Oct, 21:14', body: 'Campaign: Tower B Launch Oct · Form: 2-bed enquiry · Auto-assigned to Usman Tariq (round-robin).' },
];

const CONTACT = [
  { k: 'Mobile', v: '+92 300 512 3478 · WhatsApp', strong: true },
  { k: 'Alternate', v: '+92 51 845 2210 (office)' },
  { k: 'Email', v: 'faraz.ahmed.pk@gmail.com' },
  { k: 'CNIC', v: '37405-•••••••-3 (verified at visit)' },
  { k: 'City', v: 'Rawalpindi — Bahria Phase 7 area' },
  { k: 'Budget', v: 'PKR 1.6 – 1.9 Cr · 25% down possible', strong: true },
  { k: 'Looking for', v: '2-bed, east facing, floor 4–8, for family use' },
  { k: 'Preferred contact', v: 'WhatsApp after 17:00, Urdu' },
];

const MARKS = ['Viewed', 'Visited', 'Quoted', 'Shortlisted'];
const UNITS = [
  { code: 'B-504', spec: '2-bed · 1,150 sq ft · F5 · East', price: 'PKR 1.85 Cr', on: [true, true, true, true], status: 'On hold · 19h left' },
  { code: 'B-702', spec: '2-bed · 1,150 sq ft · F7 · West', price: 'PKR 1.92 Cr', on: [true, true, false, false], status: 'Available' },
  { code: 'B-404', spec: '2-bed · 1,150 sq ft · F4 · East', price: 'PKR 1.81 Cr', on: [true, false, false, false], status: 'Available' },
  { code: 'C-1102', spec: '3-bed · 1,620 sq ft · F11', price: 'PKR 2.40 Cr', on: [true, false, false, false], status: 'Booked' },
];

const DAYS = ['15m', '1d', '2d', '1d', '3d', '1d', '2d', '12d', '', '', '', ''];
const HIST: [string, string, number, boolean][] = [
  ['New', '15m', 2, false],
  ['Contacted', '1d', 20, false],
  ['Qualified', '2d', 30, false],
  ['Units of interest', '1d', 15, false],
  ['Visit scheduled', '3d', 45, false],
  ['Visit done', '1d', 15, false],
  ['Payment plan shared', '2d', 30, false],
  ['Negotiation (now)', '12d', 100, true],
];

const FILTERS: { key: Kind; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'call', label: 'Calls' },
  { key: 'wa', label: 'WhatsApp' },
  { key: 'visit', label: 'Visits' },
  { key: 'note', label: 'Notes' },
];

export function LeadProfile() {
  const s = useSession();
  const toast = useToast();
  const [cur, setCur] = useState(7);
  const [filter, setFilter] = useState<Kind>('all');
  const [section, setSection] = useState<Section>('activity');
  const [moreContact, setMoreContact] = useState(false);
  const [acts, setActs] = useState(ACTS);
  const [note, setNote] = useState('');
  const [logging, setLogging] = useState(false);
  const [skipTo, setSkipTo] = useState<number | null>(null);
  const [skipNote, setSkipNote] = useState('');
  const canReassign = s.role === 'manager' || s.role === 'admin';

  const shown = acts.filter((a) => filter === 'all' || a.kind === filter);

  // Stepper: forward moves only; skipping more than 2 stages asks for a note; Token+ needs a booking (Pipeline).
  const step = (i: number) => {
    if (i <= cur) return;
    if (i - cur > 2) {
      setSkipTo(i);
      setSkipNote('');
      return;
    }
    advance(i, '');
  };
  const advance = (i: number, why: string) => {
    setCur(i);
    setActs((xs) => [{ kind: 'sys', icon: 'sys', title: `Moved to ${STAGES[i]}`, meta: `${s.person.name} · just now`, body: why || `From ${STAGES[cur]}.` }, ...xs]);
    toast({ text: `Faraz Ahmed moved to ${STAGES[i]}` });
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to="/leads">{s.role === 'agent' ? 'My leads' : 'Leads'}</Link> / Faraz Ahmed
      </nav>

      <div className="panel stack-4" style={{ padding: 16 }}>
        <div className="row-wrap" style={{ gap: 16, alignItems: 'flex-start' }}>
          <Avatar initials="FA" size={48} variant="dark" />
          <div className="stack-1 spacer" style={{ minWidth: 260 }}>
            <div className="row-wrap" style={{ gap: 12 }}>
              <h1 className="t-h1">Faraz Ahmed</h1>
              <StageBadge stage={STAGES[cur]} age={cur === 7 ? '12d · SLA 7d' : '0d'} state={cur === 7 ? 'r' : 'g'} />
              {cur === 7 && <Chip tone="warn">Follow-up 6d overdue</Chip>}
            </div>
            <span className="muted">Lead #L-20931 · Saffron Residencia · Facebook Lead Ads — “Tower B Launch Oct”</span>
            <span className="small muted">
              Owner <b style={{ color: 'var(--text)' }}>Usman Tariq</b> · assigned by round-robin 22 Oct · last touched by <b style={{ color: 'var(--text)' }}>Usman Tariq</b> 6 days ago
            </span>
          </div>
          <div className="row-wrap">
            <Button variant="primary" icon="phone" onClick={() => setLogging(true)}>
              Call
            </Button>
            <Button>WhatsApp</Button>
            <Button>Log visit</Button>
            <Button>Send payment plan</Button>
            <button type="button" className="btn btn--secondary btn--icon" aria-label="More actions">
              ⋯
            </button>
          </div>
        </div>
        <ol aria-label="Stage progress" className="stepper">
          {STAGES.map((name, i) => (
            <li key={name} aria-current={i === cur ? 'step' : undefined}>
              <button type="button" className="stepper__btn" disabled={i <= cur} onClick={() => step(i)} title={i > cur ? `Move to ${name}` : undefined}>
                <span className="stepper__bar" style={{ background: i < cur ? 'var(--brand-600)' : i === cur ? 'var(--accent-500)' : 'var(--border)' }} />
                <span className="stepper__name" style={{ color: i <= cur ? 'var(--text)' : 'var(--text-muted)', fontWeight: i === cur ? 700 : 500 }}>
                  {name}
                </span>
                <span className="stepper__days">{i < cur || i === 7 ? DAYS[i] : i === cur ? '0d' : ''}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="split">
        <aside aria-label="Contact" className="stack-4" style={{ flex: '1 1 280px', maxWidth: 320 }}>
          <section className="panel stack-3" style={{ padding: 16 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <h2 className="panel__title">Contact</h2>
              <button type="button" className="btn btn--ghost btn--xs">
                Edit
              </button>
            </div>
            {(moreContact ? CONTACT : CONTACT.filter((f) => ['Mobile', 'Budget', 'Looking for', 'Preferred contact'].includes(f.k))).map((f) => (
              <div key={f.k} className="kv">
                <span>{f.k}</span>
                <span className={f.strong ? 'strong' : undefined}>{f.v}</span>
              </div>
            ))}
            <button type="button" className="btn btn--ghost btn--xs" style={{ alignSelf: 'flex-start', padding: 0 }} aria-expanded={moreContact} onClick={() => setMoreContact((x) => !x)}>
              {moreContact ? 'Show less' : `Show all ${CONTACT.length} details`}
            </button>
          </section>
          <details className="panel disclosure">
            <summary className="panel__title">Ownership</summary>
            <div className="stack-3" style={{ paddingTop: 12 }}>
            <dl className="dl">
              <dt>Owner</dt>
              <dd className="strong">Usman Tariq</dd>
              <dt>Assigned by</dt>
              <dd>Rule: Round-robin · Tower B</dd>
              <dt>Created</dt>
              <dd>22 Oct 2026, 21:14 · FB form</dd>
              <dt>Last touched</dt>
              <dd>Usman Tariq · 28 Oct, 17:40</dd>
              <dt>Visible to</dt>
              <dd>Usman, team managers, admins</dd>
            </dl>
            {canReassign ? (
              <Button size="sm" style={{ alignSelf: 'flex-start' }}>
                Reassign
              </Button>
            ) : (
              <>
                <DisabledWhy reason="Only Sales Managers can reassign leads" size="sm">
                  Reassign
                </DisabledWhy>
                <span className="small muted">Only Sales Managers can reassign leads.</span>
              </>
            )}
            </div>
          </details>
        </aside>

        <section aria-label="Lead details" className="panel" style={{ flex: '2 1 520px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <div role="tablist" aria-label="Lead sections" className="tabs">
            {(
              [
                ['activity', 'Activity', acts.length],
                ['units', 'Units of interest', UNITS.length],
                ['history', 'Stage history', '12d'],
              ] as [Section, string, number | string][]
            ).map(([k, l, n]) => (
              <button key={k} type="button" role="tab" aria-selected={section === k} className="tab" data-tour={`tab-${k}`} onClick={() => setSection(k)}>
                {l} <span className="tab__n">{n}</span>
              </button>
            ))}
          </div>
          {section === 'activity' && (
            <>
              <div className="row-wrap" role="group" aria-label="Filter activity" style={{ gap: 4, padding: '10px 16px 0' }}>
                {FILTERS.map((f) => (
                  <button key={f.key} type="button" aria-pressed={filter === f.key} className="pill-toggle" onClick={() => setFilter(f.key)}>
                    {f.label}
                  </button>
                ))}
              </div>
            <form
              className="stack-2"
              style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                setActs((xs) => [{ kind: 'note', icon: 'note', title: 'Note', meta: `${s.person.name} · just now`, body: note.trim() }, ...xs]);
                setNote('');
                toast({ text: 'Note saved · next follow-up Tomorrow 11:00' });
              }}
            >
              <label htmlFor="lp-note" className="field__label">
                Add note
              </label>
              <textarea id="lp-note" className="textarea" rows={2} placeholder="What happened? Mention a colleague with @" value={note} onChange={(e) => setNote(e.target.value)} />
              <div className="row">
                <span className="small muted">Next follow-up</span>
                <button type="button" className="btn btn--secondary btn--xs" style={{ fontWeight: 500 }}>
                  Tomorrow 11:00
                </button>
                <span className="spacer" />
                <button type="submit" className="btn btn--primary btn--sm">
                  Save
                </button>
              </div>
            </form>
            <ol className="timeline">
              {shown.map((a, i) => (
                <li key={a.title + a.meta + i}>
                  <span className={`timeline__icon ${a.tone === 'bad' ? 'is-bad' : a.tone === 'brand' ? 'is-brand' : ''}`}>
                    <Icon name={a.icon} size={14} />
                  </span>
                  <div className="stack-1 min0 spacer" style={{ gap: 2 }}>
                    <div className="row-wrap" style={{ alignItems: 'baseline' }}>
                      <b className="strong">{a.title}</b>
                      <span className="small muted">{a.meta}</span>
                    </div>
                    <span className="text-2">{a.body}</span>
                  </div>
                </li>
              ))}
              {shown.length === 0 && <li className="muted">Nothing of this type yet.</li>}
            </ol>
            </>
          )}
          {section === 'units' && (
            <div>
              <div className="row" style={{ padding: '10px 16px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--ghost btn--xs">
                  + Add unit
                </button>
              </div>
            {UNITS.map((u) => (
              <div key={u.code} className="stack-2" style={{ padding: '10px 16px', borderBottom: '1px solid var(--border-subtle)', gap: 6 }}>
                <div className="row">
                  <UnitTag>{u.code}</UnitTag>
                  <span className="small text-2 spacer">{u.spec}</span>
                  <span className="strong">{u.price}</span>
                </div>
                <div className="row-wrap" style={{ gap: 4 }}>
                  {MARKS.map((m, i) => (
                    <span key={m} className={`mark ${u.on[i] ? 'mark--on' : ''}`}>
                      {m}
                    </span>
                  ))}
                  <span className="xsmall muted" style={{ marginLeft: 'auto' }}>
                    {u.status}
                  </span>
                </div>
              </div>
            ))}
            </div>
          )}
          {section === 'history' && (
            <div className="stack-2" style={{ padding: '16px', gap: 10 }}>
            <span className="small muted">Time in stage vs SLA · 12 days total</span>
            {HIST.map(([name, d, w, late]) => (
              <div key={name} className="hist-row">
                <span className="ellipsis">{name}</span>
                <span className="track track--8">
                  <span style={{ width: `${w}%`, background: late ? 'var(--danger)' : 'var(--brand-600)' }} />
                </span>
                <span className="right strong" style={{ color: late ? 'var(--danger)' : undefined }}>
                  {d}
                </span>
              </div>
            ))}
            <span className="small muted" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
              Moved to Negotiation by Usman Tariq on 22 Oct after visit.
            </span>
            </div>
          )}
        </section>
      </div>

      {logging && (
        <Drawer title="Log call" sub="Faraz Ahmed · +92 300 512 3478" onClose={() => setLogging(false)}>
          <LogCallForm
            name="Faraz Ahmed"
            meta="Outgoing · just now"
            onSave={(o) => {
              setLogging(false);
              setActs((xs) => [{ kind: 'call', icon: 'phone', title: `Call · ${o}`, meta: `${s.person.name} · just now`, body: 'Logged from the call drawer.' }, ...xs]);
              toast({ text: `Call logged · ${o}` });
            }}
          />
        </Drawer>
      )}

      {skipTo !== null && (
        <Modal
          title={`Skip to ${STAGES[skipTo]}?`}
          sub={`Skipping ${skipTo - cur - 1} stages needs a note so the team knows why.`}
          onClose={() => setSkipTo(null)}
          actions={
            <>
              <Button onClick={() => setSkipTo(null)}>Cancel</Button>
              <Button
                variant="primary"
                disabled={!skipNote.trim()}
                onClick={() => {
                  advance(skipTo, skipNote.trim());
                  setSkipTo(null);
                }}
              >
                Move stage
              </Button>
            </>
          }
        >
          <div className="field">
            <label htmlFor="skip-note" className="field__label">
              Note (required)
            </label>
            <textarea id="skip-note" className="textarea" rows={3} value={skipNote} onChange={(e) => setSkipNote(e.target.value)} />
          </div>
        </Modal>
      )}
    </>
  );
}
