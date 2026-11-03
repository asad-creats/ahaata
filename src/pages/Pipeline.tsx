import { useMemo, useRef, useState, type DragEvent, type KeyboardEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Age, Avatar, Button, Drawer, FilterChip, Modal, SourceTag, UnitTag } from '../components/ui';
import { BOOKING_FROM, COLUMNS, LOST_REASONS, STAGES, type Card, type Column } from '../data/pipeline';
import { useToast } from '../lib/toast';

/** Drop targets: column index 0–11, or the docked Lost / Nurture zones. */
type Target = number | 'lost' | 'nurture';
const LOST = 12;
const NURTURE = 13;
const fromIndex = (i: number): Target => (i === LOST ? 'lost' : i === NURTURE ? 'nurture' : i);

type Pending = { card: Card; from: number; to: Target };

export function Pipeline() {
  const toast = useToast();
  const nav = useNavigate();
  const [cols, setCols] = useState<Column[]>(() => COLUMNS.map((c) => ({ ...c, cards: [...c.cards] })));
  const [lostCount, setLostCount] = useState(88);
  const [nurtureCount, setNurtureCount] = useState(164);
  const [overdueOnly, setOverdueOnly] = useState(false);
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

  const remove = (card: Card, from: number) => setCols((cs) => cs.map((c, i) => (i === from ? { ...c, n: c.n - 1, cards: c.cards.filter((x) => x.id !== card.id) } : c)));

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
      remove(card, from);
      setNurtureCount((n) => n + 1);
      toast({ text: `${card.name} moved to Nurture · monthly WhatsApp drip`, action: { label: 'Undo', onClick: () => undoInto(card, from, () => setNurtureCount((n) => n - 1)) } });
      return;
    }
    move(card, from, to);
    toast({ text: `${card.name} moved to ${STAGES[to]}`, action: { label: 'Undo', onClick: () => move(card, to, from) } });
  };

  const undoInto = (card: Card, to: number, after: () => void) => {
    setCols((cs) => cs.map((c, i) => (i === to ? { ...c, n: c.n + 1, cards: [card, ...c.cards] } : c)));
    after();
  };

  const confirmLost = () => {
    setTried(true);
    if (!pending || !reason || (reason.startsWith('Other') && !lostNote.trim())) return;
    remove(pending.card, pending.from);
    setLostCount((n) => n + 1);
    toast({ text: `${pending.card.name} marked as lost · ${reason}` });
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

      <div className="row-wrap">
        <FilterChip label="Agent" value="All team (9)" />
        <FilterChip label="Source" value="Any" />
        <FilterChip label="Unit type" value="Any" />
        <label className="filter-chip check">
          <input type="checkbox" checked={overdueOnly} onChange={(e) => setOverdueOnly(e.target.checked)} /> Only overdue in stage
        </label>
        <span className="spacer" />
        <span className="small muted">Age badge = days in current stage vs. stage SLA</span>
      </div>

      <nav aria-label="Jump to stage" className="stage-strip">
        {cols.map((c, i) => (
          <button
            key={c.name}
            type="button"
            className="stage-strip__item"
            style={{ background: i < 6 ? 'var(--brand-tint)' : undefined }}
            onClick={() => document.getElementById(`col-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' })}
          >
            <span className="xsmall muted nowrap">{c.name}</span>
            <span className="row bold" style={{ gap: 6, alignItems: 'baseline' }}>
              {c.n}
              {c.late > 0 && <span className="xsmall strong danger-text">{c.late} late</span>}
            </span>
          </button>
        ))}
      </nav>

      {picked && (
        <div className="sr-only" aria-live="assertive">
          Picked up {picked.name}. Target: {kbd && (kbd.to === LOST ? 'Lost' : kbd.to === NURTURE ? 'Nurture' : STAGES[kbd.to])}. Press Space to drop.
        </div>
      )}

      <div className="board">
        <div className="board__scroll" ref={boardRef}>
          <div className="board__cols">
            {cols.map((col, i) => {
              const cards = overdueOnly ? col.cards.filter((c) => c.st !== 'g') : col.cards;
              const isOver = over === i;
              return (
                <section key={col.name} id={`col-${i}`} aria-label={col.name} className={`kcol ${isOver ? 'kcol--over' : ''}`} {...dropProps(i)}>
                  <header className="kcol__head">
                    <div className="row" style={{ gap: 6 }}>
                      <b className="strong">{col.name}</b>
                      <span className="small muted">{col.n}</span>
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
                    {col.n - col.cards.length > 0 && !overdueOnly && (
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
          <div className={`dock dock--lost ${over === 'lost' ? 'dock--over' : ''}`} {...dropProps('lost')}>
            <div className="row" style={{ gap: 6 }}>
              <b>Lost</b>
              <span className="small muted">· {lostCount} this month</span>
            </div>
            <span className="small strong danger-text">{dragId || kbd ? 'Release to choose a reason' : 'Drop a card here to mark it lost'}</span>
          </div>
          <div className={`dock dock--nurture ${over === 'nurture' ? 'dock--over' : ''}`} {...dropProps('nurture')}>
            <div className="row" style={{ gap: 6 }}>
              <b>Nurture</b>
              <span className="small muted">· {nurtureCount}</span>
            </div>
            <span className="small muted">Monthly WhatsApp drip; resurfaces on new activity</span>
          </div>
        </aside>
      </div>

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
              <label key={r} className={`lost-reason ${reason === r ? 'is-on' : ''}`}>
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
