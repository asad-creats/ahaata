import { createContext, useCallback, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { COLUMNS, STAGES, type Card, type Column } from '../data/pipeline';

export type ArchiveKind = 'lost' | 'nurture';

export type Archived = {
  id: string;
  card: Card;
  kind: ArchiveKind;
  fromStage: string;
  /** Lost: the required lost reason. Nurture: why it isn't ready yet. */
  reason: string;
  note?: string;
  when: string;
  by: string;
  /** Nurture only: last drip message and whether it was opened. */
  drip?: string;
};

let seq = 0;
const card = (name: string, unit: string, src: string, owner: string, budget: string): Card => ({ id: `ar${++seq}`, name, unit, src, owner, budget, age: '—', st: 'g' });

const SAMPLE: Archived[] = [
  { id: 'a1', kind: 'lost', card: card('Rashid Iqbal', 'B-1101', 'Facebook', 'UT', 'PKR 1.75 Cr'), fromStage: 'Payment plan shared', reason: 'Price above budget', note: 'Floors 9–12 too expensive after v7', when: '1 Nov', by: 'Usman Tariq' },
  { id: 'a2', kind: 'lost', card: card('Saba Karim', '3-bed', 'Zameen', 'SN', 'PKR 2.6 Cr'), fromStage: 'Visit done', reason: 'Bought elsewhere', note: 'Bought in a nearby society, lower down payment', when: '30 Oct', by: 'Sana Naveed' },
  { id: 'a3', kind: 'lost', card: card('Noman Ali', '2-bed', 'Facebook', 'SN', 'PKR 1.6 Cr'), fromStage: 'New', reason: 'Not reachable (5 tries)', when: '29 Oct', by: 'Sana Naveed' },
  { id: 'a4', kind: 'lost', card: card('Fiza Javed', 'C-604', 'Graana', 'MB', 'PKR 2.2 Cr'), fromStage: 'Negotiation', reason: 'Payment plan terms', note: 'Wanted 5-year plan', when: '27 Oct', by: 'Maryam Baig' },
  { id: 'a5', kind: 'lost', card: card('Adeel Shah', 'Studio', 'Website', '?', 'PKR 80 lakh'), fromStage: 'New', reason: 'Duplicate / fake lead', when: '26 Oct', by: 'System' },
  { id: 'n1', kind: 'nurture', card: card('Waseem Akram', '3-bed', 'Expo', 'UT', 'PKR 2.8 Cr'), fromStage: 'Qualified', reason: 'Buying after Dec 2027', when: '12 Oct', by: 'Usman Tariq', drip: 'Progress update · 1 Nov · opened' },
  { id: 'n2', kind: 'nurture', card: card('Sobia Khurshid', '2-bed', 'Zameen', 'MB', 'PKR 2.10 Cr'), fromStage: 'Visit done', reason: 'Waiting to sell current house', when: '3 Oct', by: 'Maryam Baig', drip: 'Payment plan reminder · 1 Nov · not opened' },
  { id: 'n3', kind: 'nurture', card: card('Tahir Mehmood (UK)', 'Studio', 'Facebook', 'MB', 'GBP 70k'), fromStage: 'Contacted', reason: 'Overseas, visiting Pakistan in March', when: '20 Sep', by: 'Maryam Baig', drip: 'Video tour link · 1 Nov · opened twice' },
  { id: 'n4', kind: 'nurture', card: card('Huma Rashid', 'Plot 5 marla', 'Walk-in', 'FN', 'PKR 70 lakh'), fromStage: 'Units of interest', reason: 'Budget not ready', when: '14 Sep', by: 'Fahad Nadeem', drip: 'Block A launch offer · 1 Nov · not opened' },
];

/** The rest of this month's 88 lost and 164 nurtured leads aren't listed in the demo. */
const LOST_BASE = 88 - SAMPLE.filter((a) => a.kind === 'lost').length;
const NURTURE_BASE = 164 - SAMPLE.filter((a) => a.kind === 'nurture').length;

type Store = {
  cols: Column[];
  setCols: Dispatch<SetStateAction<Column[]>>;
  archived: Archived[];
  lostCount: number;
  nurtureCount: number;
  /** Take a card off the board into Lost or Nurture. Returns an undo. */
  archive: (a: Omit<Archived, 'id' | 'when'> & { fromIndex?: number }) => () => void;
  /** Bring an archived lead back into the pipeline at a stage. Returns an undo. */
  reopen: (id: string, stageIndex: number, note: string, by: string) => () => void;
  /** Timeline entries added this session, newest first, keyed by lead name. */
  events: Record<string, LeadEvent[]>;
};

export type LeadEvent = { id: string; kind: 'lost' | 'nurture' | 'reopen'; title: string; meta: string; body?: string };

const now = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

const Ctx = createContext<Store | null>(null);

export function PipelineProvider({ children }: { children: ReactNode }) {
  const [cols, setCols] = useState<Column[]>(() => COLUMNS.map((c) => ({ ...c, cards: [...c.cards] })));
  const [archived, setArchived] = useState<Archived[]>(SAMPLE);

  const removeFromBoard = useCallback((cardId: string) => setCols((cs) => cs.map((c) => (c.cards.some((x) => x.id === cardId) ? { ...c, n: c.n - 1, cards: c.cards.filter((x) => x.id !== cardId) } : c))), []);

  const putOnBoard = useCallback((c: Card, stageIndex: number) => setCols((cs) => cs.map((col, i) => (i === stageIndex ? { ...col, n: col.n + 1, cards: [c, ...col.cards] } : col))), []);

  const [events, setEvents] = useState<Record<string, LeadEvent[]>>({});
  const addEvent = useCallback((lead: string, ev: Omit<LeadEvent, 'id'>) => {
    const id = `e${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
    setEvents((m) => ({ ...m, [lead]: [{ ...ev, id }, ...(m[lead] ?? [])] }));
    return () => setEvents((m) => ({ ...m, [lead]: (m[lead] ?? []).filter((e) => e.id !== id) }));
  }, []);

  const archive = useCallback<Store['archive']>(
    ({ fromIndex, ...a }) => {
      const id = `x${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
      const entry: Archived = { ...a, id, when: 'Today' };
      if (fromIndex !== undefined) removeFromBoard(a.card.id);
      setArchived((xs) => [entry, ...xs]);
      const undoEvent = addEvent(a.card.name, {
        kind: a.kind,
        title: a.kind === 'lost' ? `Marked lost · ${a.reason}` : 'Moved to Nurture',
        meta: `${a.by} · today ${now()} · from ${a.fromStage}`,
        body: a.kind === 'lost' ? a.note : `${a.reason}. Gets a WhatsApp message on the 1st of each month.`,
      });
      return () => {
        setArchived((xs) => xs.filter((x) => x.id !== id));
        if (fromIndex !== undefined) putOnBoard(a.card, fromIndex);
        undoEvent();
      };
    },
    [removeFromBoard, putOnBoard, addEvent],
  );

  const reopen = useCallback<Store['reopen']>(
    (id, stageIndex, note, by) => {
      const entry = archived.find((x) => x.id === id);
      if (!entry) return () => {};
      const back: Card = { ...entry.card, age: '0m', st: 'g' };
      setArchived((xs) => xs.filter((x) => x.id !== id));
      putOnBoard(back, stageIndex);
      // Sample leads were archived before this session, so record why they left before the reopen.
      const hadRecord = (events[entry.card.name] ?? []).some((e) => e.kind === entry.kind);
      const undoRecord = hadRecord
        ? () => {}
        : addEvent(entry.card.name, {
            kind: entry.kind,
            title: entry.kind === 'lost' ? `Marked lost · ${entry.reason}` : 'Moved to Nurture',
            meta: `${entry.by} · ${entry.when} · from ${entry.fromStage}`,
            body: entry.note ?? (entry.kind === 'nurture' ? entry.reason : undefined),
          });
      const undoEvent = addEvent(entry.card.name, {
        kind: 'reopen',
        title: `Reopened from ${entry.kind === 'lost' ? 'Lost' : 'Nurture'} → ${STAGES[stageIndex]}`,
        meta: `${by} · today ${now()}`,
        body: note,
      });
      return () => {
        removeFromBoard(back.id);
        setArchived((xs) => [entry, ...xs]);
        undoEvent();
        undoRecord();
      };
    },
    [archived, events, putOnBoard, removeFromBoard, addEvent],
  );

  const value = useMemo<Store>(() => {
    const lost = archived.filter((a) => a.kind === 'lost').length;
    return { cols, setCols, archived, lostCount: LOST_BASE + lost, nurtureCount: NURTURE_BASE + archived.length - lost, archive, reopen, events };
  }, [cols, archived, archive, reopen, events]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePipeline() {
  const s = useContext(Ctx);
  if (!s) throw new Error('usePipeline must be used inside PipelineProvider');
  return s;
}

/** Stages a reopened lead can return to. Token and later need a booking, so they're excluded. */
export const REOPEN_STAGES = STAGES.slice(0, STAGES.indexOf('Token'));
