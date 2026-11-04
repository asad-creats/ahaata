import { useEffect, useMemo, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Age, Avatar, Button, Drawer, Modal, SourceTag, UnitTag } from '../components/ui';
import { BOOKING_FROM, LOST_REASONS, STAGES, type Card } from '../data/pipeline';
import { ArchiveList, ReopenModal } from '../components/Archive';
import { usePipeline, type ArchiveKind, type Archived } from '../lib/pipelineStore';
import { useSession } from '../lib/session';
import { Icon } from '../components/Icon';
import { usePopover } from '../lib/hooks';
import { useToast } from '../lib/toast';

const NO_FILTERS = { agent: 'All team (9)', source: 'Any', unit: 'Any' };

/** Drop targets: column index 0–11, or the docked Lost / Nurture zones. */
type Target = number | 'lost' | 'nurture';
const LOST = 12;
const NURTURE = 13;
const fromIndex = (i: number): Target => (i === LOST ? 'lost' : i === NURTURE ? 'nurture' : i);

type Pending = { card: Card; from: number; to: Target };

export function Pipeline() {
  const toast = useToast();
  const nav = useNavigate();
  const { cols, setCols, lostCount, nurtureCount, archive } = usePipeline();
  const { person } = useSession();
  const [listOf, setListOf] = useState<ArchiveKind | null>(null);
  const [reopening, setReopening] = useState<Archived | null>(null);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [filters, setFilters] = useState(NO_FILTERS);
  const filterPop = usePopover();
  const activeFilters = Object.values(filters).filter((v) => !v.startsWith('Any') && !v.startsWith('All')).length;
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<Target | null>(null);
  const [kbd, setKbd] = useState<{ id: string; to: number } | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [lostNote, setLostNote] = useState('');
  const [tried, setTried] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const find = (id: string) => {
    for (let i = 0; i < cols.length; i++) {
      const card = cols[i].cards.find((c) => c.id === id);
      if (card) return { card, from: i };
    }
    return null;
  };

  const move = (card: Card, from: number, to: number) =>
    setCols((cs) =>
      cs.map((c, i) => {
        if (i === from) return { ...c, n: c.n - 1, cards: c.cards.filter((x) => x.id !== card.id) };
        if (i === to) return { ...c, n: c.n + 1, cards: [{ ...card, age: '0m', st: 'g' }, ...c.cards] };
        return c;
      }),
    );

  /** Lost needs a reason; Token or later needs a Booking. Everything else moves straight away. */
  const drop = (id: string, to: Target) => {
    const hit = find(id);
    if (!hit || hit.from === to) return;
    const { card, from } = hit;
    if (to === 'lost' || (typeof to === 'number' && to >= BOOKING_FROM && from < BOOKING_FROM)) {
      setPending({ card, from, to });
      setReason(null);
      setLostNote('');
      setTried(false);
      return;
    }
    if (to === 'nurture') {
      const undo = archive({ card, kind: 'nurture', fromStage: STAGES[from], reason: 'Not ready yet', by: person.name, fromIndex: from });
      toast({ text: `${card.name} moved to Nurture · monthly WhatsApp messages`, action: { label: 'Undo', onClick: undo } });
      return;
    }
    move(card, from, to);
    toast({ text: `${card.name} moved to ${STAGES[to]}`, action: { label: 'Undo', onClick: () => move(card, to, from) } });
  };

  // The guided tour "drags" a card by announcing the drop; it lands exactly like a mouse drop.
  const dropByName = useRef<(name: string, to: Target) => void>(() => {});
  dropByName.current = (name, to) => {
    const card = cols.flatMap((c) => c.cards).find((c) => c.name === name);
    if (card) drop(card.id, to);
  };
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent<{ name: string; to: Target }>).detail;
      dropByName.current(d.name, d.to);
    };
    window.addEventListener('tour:drop', h);
    return () => window.removeEventListener('tour:drop', h);
  }, []);

  const confirmLost = () => {
    setTried(true);
    if (!pending || !reason || (reason.startsWith('Other') && !lostNote.trim())) return;
    const undo = archive({ card: pending.card, kind: 'lost', fromStage: STAGES[pending.from], reason, note: lostNote.trim() || undefined, by: person.name, fromIndex: pending.from });
    toast({ text: `${pending.card.name} marked as lost · ${reason}`, action: { label: 'Undo', onClick: undo } });
    setPending(null);
  };

  const confirmBooking = () => {
    if (!pending || typeof pending.to !== 'number') return;
    move(pending.card, pending.from, pending.to);
    toast({ text: `Booking created for ${pending.card.name} · moved to ${STAGES[pending.to]}` });
    setPending(null);
  };

  // Keyboard: focus a card, Space to pick up, arrows to move, Space to drop, Esc to cancel.
  const onCardKey = (e: KeyboardEvent, card: Card, col: number) => {
    if (e.key === ' ') {
      e.preventDefault();
      if (kbd?.id === card.id) {
        const target = fromIndex(kbd.to);
        setKbd(null);
        setOver(null);
        if (kbd.to !== col) drop(card.id, target);
      } else {
        setKbd({ id: card.id, to: col });
        setOver(col);
      }
    } else if (kbd?.id === card.id && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      e.preventDefault();
      const to = Math.max(0, Math.min(NURTURE, kbd.to + (e.key === 'ArrowRight' ? 1 : -1)));
      setKbd({ id: card.id, to });
      setOver(fromIndex(to));
      if (to < LOST) document.getElementById(`col-${to}`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    } else if (e.key === 'Escape' && kbd) {
      setKbd(null);
      setOver(null);
    } else if (e.key === 'Enter') {
      nav('/leads/L-20931');
    }
  };

  const totalOpen = useMemo(() => cols.reduce((n, c) => n + c.n, 0) - cols.slice(BOOKING_FROM).reduce((n, c) => n + c.n, 0), [cols]);

  const dropProps = (t: Target) => ({
    onDragOver: (e: DragEvent) => {
      if (!dragId) return;
      e.preventDefault();
      if (over !== t) setOver(t);
    },
    onDragLeave: (e: DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver((o) => (o === t ? null : o));
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      if (dragId) drop(dragId, t);
      setDragId(null);
      setOver(null);
    },
  });

  const picked = kbd ? find(kbd.id)?.card : null;

  return (
    <>
      <div className="page-head">
        <h1 className="t-h1">Pipeline</h1>
        <span className="muted">{totalOpen + 296} open leads · PKR 86.4 Cr weighted</span>
        <span className="spacer" />
        <div role="group" aria-label="View" className="seg">
          <button type="button" aria-pressed="true">
            Board
          </button>
          <Link to="/leads">Table</Link>
        </div>
        <button type="button" className="btn btn--primary btn--sm">
          Add lead
        </button>
      </div>

      <div className="pipe-toolbar">
        <div style={{ position: 'relative' }} ref={filterPop.ref}>
          <button type="button" className="filter-chip" aria-expanded={filterPop.open} onClick={filterPop.toggle}>
            <Icon name="funnel" size={14} />
            Filters
            {activeFilters > 0 && <span className="count">{activeFilters}</span>}
          </button>
          {filterPop.open && (
            <div className="menu stack-3" style={{ top: 40, left: 0, width: 280, padding: 16 }} role="dialog" aria-label="Pipeline filters">
              {(
                [
                  ['agent', 'Agent', ['All team (9)', 'Usman Tariq', 'Maryam Baig', 'Fahad Nadeem', 'Sana Naveed']],
                  ['source', 'Source', ['Any', 'Facebook', 'Zameen', 'Graana', 'Expo', 'Dealer', 'Walk-in', 'Website']],
                  ['unit', 'Unit type', ['Any', 'Studio', '1-bed', '2-bed', '3-bed', 'Plot', 'Shop']],
                ] as [keyof typeof filters, string, string[]][]
              ).map(([k, label, opts]) => (
                <label key={k} className="field">
                  <span className="field__label">{label}</span>
                  <select className="select select--sm" value={filters[k]} onChange={(e) => setFilters((f) => ({ ...f, [k]: e.target.value }))}>
                    {opts.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </label>
              ))}
              <button type="button" className="btn btn--ghost btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => setFilters(NO_FILTERS)}>
                Clear filters
              </button>
            </div>
          )}
        </div>
        <button type="button" className="filter-chip" aria-pressed={overdueOnly} data-on={overdueOnly} onClick={() => setOverdueOnly((x) => !x)}>
          <Icon name="warn" size={14} />
          Overdue only
        </button>
        <span className="spacer" />
        <label className="row small muted" style={{ gap: 6 }}>
          Jump to
          <select
            className="select select--sm"
            value=""
            onChange={(e) => document.getElementById(`col-${e.target.value}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })}
          >
            <option value="" disabled>
              Stage…
            </option>
            {cols.map((c, i) => (
              <option key={c.name} value={i}>
                {c.name} · {c.n}
                {c.late ? ` · ${c.late} late` : ''}
              </option>
            ))}
          </select>
        </label>
        <span className="why">
          <button type="button" className="btn btn--ghost btn--icon btn--sm" aria-describedby="age-help" aria-label="What the age badge means" style={{ color: 'var(--text-muted)' }}>
            <Icon name="info" />
          </button>
          <span role="tooltip" id="age-help" className="why__tip" style={{ left: 'auto', right: 0 }}>
            Age badge = days in the current stage. Amber past 75% of the stage SLA, red when overdue.
          </span>
        </span>
      </div>

      {picked && (
        <div className="sr-only" aria-live="assertive">
          Picked up {picked.name}. Target: {kbd && (kbd.to === LOST ? 'Lost' : kbd.to === NURTURE ? 'Nurture' : STAGES[kbd.to])}. Press Space to drop.
        </div>
      )}

      <div className="board">
        <div className="board__scroll" ref={boardRef}>
          <div className="board__cols">
            {cols.map((col, i) => {
              const ini = filters.agent.split(' ').map((w) => w[0]).join('');
              const cards = col.cards.filter(
                (c) =>
                  (!overdueOnly || c.st !== 'g') &&
                  (filters.source === 'Any' || c.src === filters.source) &&
                  (filters.unit === 'Any' || c.unit.toLowerCase().includes(filters.unit.toLowerCase())) &&
                  (filters.agent.startsWith('All') || c.owner === ini),
              );
              const isOver = over === i;
              return (
                <section key={col.name} id={`col-${i}`} aria-label={col.name} className={`kcol ${isOver ? 'kcol--over' : ''}`} {...dropProps(i)}>
                  <header className="kcol__head">
                    <div className="row" style={{ gap: 6 }}>
                      <b className="strong">{col.name}</b>
                      <span className="small muted">{col.n}</span>
                      {col.late > 0 && (
                        <span className="xsmall strong danger-text" style={{ marginLeft: 'auto' }}>
                          {col.late} late
                        </span>
                      )}
                    </div>
                    <span className="small muted">
                      {col.value} · SLA {col.sla}
                    </span>
                    {isOver && i >= BOOKING_FROM && <span className="xsmall strong warning-text">Needs a booking (unit + amount)</span>}
                  </header>
                  <div className="kcol__cards">
                    {cards.map((c) => (
                      <article
                        key={c.id}
                        data-tour={`card-${c.name}`}
                        className={`kcard ${dragId === c.id ? 'kcard--dragging' : ''} ${kbd?.id === c.id ? 'kcard--picked' : ''}`}
                        draggable
                        tabIndex={0}
                        aria-roledescription="Draggable lead card"
                        aria-label={`${c.name}, ${c.unit}, ${c.age} in stage. Space to pick up.`}
                        onDragStart={(e) => {
                          setDragId(c.id);
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('text/plain', c.id);
                        }}
                        onDragEnd={() => {
                          setDragId(null);
                          setOver(null);
                        }}
                        onKeyDown={(e) => onCardKey(e, c, i)}
                      >
                        <div className="row" style={{ alignItems: 'flex-start', gap: 6 }}>
                          <Link to="/leads/L-20931" className="cell-link ellipsis spacer" draggable={false} tabIndex={-1}>
                            {c.name}
                          </Link>
                          <Age state={c.st}>{c.age}</Age>
                        </div>
                        <div className="row-wrap" style={{ gap: 6 }}>
                          <UnitTag small>{c.unit}</UnitTag>
                          <SourceTag small>{c.src}</SourceTag>
                        </div>
                        <div className="row small muted" style={{ gap: 6 }}>
                          <Avatar initials={c.owner} size={20} />
                          <span className="spacer">{c.budget}</span>
                        </div>
                      </article>
                    ))}
                    {col.n - col.cards.length > 0 && !overdueOnly && activeFilters === 0 && (
                      <button type="button" className="btn btn--ghost btn--sm" style={{ justifyContent: 'flex-start', padding: '0 4px' }}>
                        + {col.n - col.cards.length} more
                      </button>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <aside aria-label="Drop zones" className="board__docks">
          <div data-tour="dock-lost" className={`dock dock--lost ${over === 'lost' ? 'dock--over' : ''}`} {...dropProps('lost')}>
            <div className="row" style={{ gap: 6 }}>
              <b>Lost</b>
              <span className="small muted">· {lostCount} this month</span>
            </div>
            <span className="small strong danger-text">{dragId || kbd ? 'Release to choose a reason' : 'Drop a card here to mark it lost'}</span>
            <button type="button" className="btn btn--secondary btn--sm dock__view" data-tour="view-lost" onClick={() => setListOf('lost')}>
              View lost leads
            </button>
          </div>
          <div className={`dock dock--nurture ${over === 'nurture' ? 'dock--over' : ''}`} {...dropProps('nurture')}>
            <div className="row" style={{ gap: 6 }}>
              <b>Nurture</b>
              <span className="small muted">· {nurtureCount}</span>
            </div>
            <span className="small muted">Monthly WhatsApp messages; comes back on new activity</span>
            <button type="button" className="btn btn--secondary btn--sm dock__view" data-tour="view-nurture" onClick={() => setListOf('nurture')}>
              View nurture list
            </button>
          </div>
        </aside>
      </div>

      {listOf && (
        <Drawer
          wide
          title={listOf === 'lost' ? `Lost · ${lostCount} this month` : `Nurture · ${nurtureCount}`}
          sub={listOf === 'lost' ? 'Closed deals and why. Reopen one if the buyer comes back.' : 'Not ready yet. Each gets a WhatsApp message on the 1st of the month.'}
          onClose={() => setListOf(null)}
          footer={
            <Link to={`/leads?view=${listOf}`} className="btn btn--ghost btn--sm">
              Open in Leads table
            </Link>
          }
        >
          <div className="panel panel--clip" style={{ margin: '-16px', border: 0, borderRadius: 0 }}>
            <ArchiveList kind={listOf} onReopen={setReopening} />
          </div>
        </Drawer>
      )}

      {reopening && <ReopenModal entry={reopening} onClose={() => setReopening(null)} />}

      {pending && pending.to === 'lost' && (
        <Modal
          title={`Move ${pending.card.name} to Lost`}
          sub={`From ${STAGES[pending.from]} · ${pending.card.age} in stage · ${pending.card.unit}`}
          onClose={() => setPending(null)}
          actions={
            <>
              <Button onClick={() => setPending(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmLost}>
                Mark as lost
              </Button>
            </>
          }
        >
          <fieldset className="lost-reasons">
            <legend className="field__label" style={{ marginBottom: 8 }}>
              Lost reason (required)
            </legend>
            {LOST_REASONS.map((r) => (
              <label key={r} data-tour={`reason-${r}`} className={`lost-reason ${reason === r ? 'is-on' : ''}`}>
                <input type="radio" name="lost" checked={reason === r} onChange={() => setReason(r)} /> {r}
              </label>
            ))}
          </fieldset>
          {tried && !reason && <span className="field__error">Choose a lost reason to continue.</span>}
          <div className="field">
            <label htmlFor="lost-note" className="field__label">
              Competitor / note{reason?.startsWith('Other') ? ' (required)' : ''}
            </label>
            <input id="lost-note" className="input" value={lostNote} onChange={(e) => setLostNote(e.target.value)} placeholder="e.g. Bought 10 marla in a nearby society, lower down payment" aria-invalid={tried && !!reason?.startsWith('Other') && !lostNote.trim()} />
          </div>
          {/^(Plot |[A-Z]-\d)/.test(pending.card.unit) && (
            <label className="check">
              <input type="checkbox" defaultChecked /> Release hold on {pending.card.unit}
            </label>
          )}
        </Modal>
      )}

      {pending && typeof pending.to === 'number' && (
        <Drawer
          title={`Booking for ${pending.card.name}`}
          sub={`Required to move to ${STAGES[pending.to]} · stage cannot advance without a Booking`}
          onClose={() => setPending(null)}
          footer={
            <>
              <Button onClick={() => setPending(null)}>Cancel</Button>
              <Button variant="primary" className="btn--fill" onClick={confirmBooking}>
                Create booking
              </Button>
            </>
          }
        >
          <div className="field">
            <label htmlFor="bk-unit" className="field__label">
              Unit
            </label>
            <select id="bk-unit" className="select" defaultValue={pending.card.unit}>
              <option>{pending.card.unit}</option>
              <option>B-404</option>
              <option>B-702</option>
            </select>
            <span className="field__hint">Only available units and this lead’s holds are listed.</span>
          </div>
          <div className="field">
            <label htmlFor="bk-amt" className="field__label">
              Token amount (PKR)
            </label>
            <input id="bk-amt" className="input" defaultValue="5,00,000" inputMode="numeric" />
          </div>
          <div className="field">
            <label htmlFor="bk-plan" className="field__label">
              Payment plan
            </label>
            <select id="bk-plan" className="select">
              <option>3-year quarterly · 25% down</option>
              <option>4-year quarterly · 20% down</option>
              <option>2-year monthly · 30% down</option>
            </select>
          </div>
          <div className="callout callout--neutral small">Finance confirms the token receipt before the booking is final. The unit is held until then.</div>
        </Drawer>
      )}
    </>
  );
}
