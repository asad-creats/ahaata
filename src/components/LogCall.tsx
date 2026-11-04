import { useState } from 'react';
import { Button } from './ui';

const OUTCOMES = ['Interested', 'Call back later', 'No answer', 'Not interested'] as const;

/**
 * Log call: outcome (required) → next follow-up (pre-filled +1 day 11:00) → note.
 * Used in the desktop drawer and the mobile bottom sheet. Saves offline and syncs.
 */
export function LogCallForm({ name, meta, onSave, large }: { name: string; meta: string; onSave: (outcome: string) => void; large?: boolean }) {
  const [outcome, setOutcome] = useState<string | null>(large ? 'Interested' : null);
  const [next, setNext] = useState('Wed 4 Nov, 11:00');
  const [note, setNote] = useState(large ? 'Agreed PKR 1.80 Cr if 25% down. Wants token by Friday. Share revised plan.' : '');
  const [tried, setTried] = useState(false);
  const h = large ? 44 : 40;
  return (
    <form
      className="stack-4"
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (outcome) onSave(outcome);
      }}
    >
      <div>
        <div className="t-h3">Call with {name}</div>
        <div className="small muted">{meta}</div>
      </div>
      <fieldset className="logcall__fs">
        <legend className="field__label" style={{ marginBottom: 8 }}>
          Outcome (required)
        </legend>
        <div className="logcall__grid">
          {OUTCOMES.map((o) => (
            <button key={o} type="button" data-tour={`outcome-${o}`} className="toggle" style={{ height: h }} aria-pressed={outcome === o} onClick={() => setOutcome(o)}>
              {o}
            </button>
          ))}
        </div>
        {tried && !outcome && <span className="field__error" style={{ marginTop: 6 }}>Pick an outcome to save the call.</span>}
      </fieldset>
      <div className="field">
        <label htmlFor="lc-next" className="field__label">
          Next follow-up
        </label>
        <div className="row">
          <input id="lc-next" className="input" style={{ flex: 1, height: h }} value={next} onChange={(e) => setNext(e.target.value)} />
          <button type="button" className="btn btn--secondary" style={{ height: h, fontWeight: 500 }} onClick={() => setNext('Thu 5 Nov, 11:00')}>
            +1 day
          </button>
        </div>
      </div>
      <div className="field">
        <label htmlFor="lc-note" className="field__label">
          Note
        </label>
        <textarea id="lc-note" className="textarea" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did they say? Mention a colleague with @" />
      </div>
      <label className="check">
        <input type="checkbox" defaultChecked={large} style={large ? { width: 20, height: 20 } : undefined} /> Move stage to Token after payment
      </label>
      <Button type="submit" variant="primary" size={large ? 'xl' : 'lg'} style={large ? { height: 48 } : undefined}>
        Save call log
      </Button>
    </form>
  );
}
