import { useState } from 'react';
import { Link } from 'react-router-dom';
import { REOPEN_STAGES, usePipeline, type ArchiveKind, type Archived } from '../lib/pipelineStore';
import { useSession } from '../lib/session';
import { useToast } from '../lib/toast';
import { Icon } from './Icon';
import { Avatar, Button, Chip, Modal, SourceTag, UnitTag } from './ui';

/** Leads taken off the board: Lost (with reason) or Nurture (on the monthly WhatsApp drip). */
export function ArchiveList({ kind, query = '', onReopen }: { kind: ArchiveKind; query?: string; onReopen: (a: Archived) => void }) {
  const { archived, lostCount, nurtureCount } = usePipeline();
  const q = query.trim().toLowerCase();
  const rows = archived.filter((a) => a.kind === kind && (!q || a.card.name.toLowerCase().includes(q) || a.reason.toLowerCase().includes(q)));
  const total = kind === 'lost' ? lostCount : nurtureCount;
  const lost = kind === 'lost';

  return (
    <>
      <div className="table-scroll">
        <table className="dt" style={{ minWidth: 760 }}>
          <thead>
            <tr>
              <th>Lead</th>
              <th>{lost ? 'Lost reason' : 'Why nurturing'}</th>
              <th>Left from</th>
              <th>{lost ? 'Marked lost' : 'Last message'}</th>
              <th>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>
                  <span className="cell-stack">
                    <Link to={`/leads/${a.card.id}`} className="cell-link">
                      {a.card.name}
                    </Link>
                    <span className="row small muted" style={{ gap: 6, marginTop: 2 }}>
                      <UnitTag small>{a.card.unit}</UnitTag>
                      <SourceTag small>{a.card.src}</SourceTag>
                      <span className="nowrap">{a.card.budget}</span>
                    </span>
                  </span>
                </td>
                <td>
                  <span className="cell-stack">
                    {lost ? (
                      <span style={{ alignSelf: 'flex-start' }}>
                        <Chip tone="bad" small>
                          {a.reason}
                        </Chip>
                      </span>
                    ) : (
                      <span>{a.reason}</span>
                    )}
                    {a.note && <span className="small muted" style={{ marginTop: 4 }}>“{a.note}”</span>}
                  </span>
                </td>
                <td className="small">{a.fromStage}</td>
                <td className="small">
                  {lost ? (
                    <span className="cell-stack">
                      <span>{a.when}</span>
                      <span className="row muted" style={{ gap: 6 }}>
                        <Avatar initials={a.card.owner} size={20} /> {a.by}
                      </span>
                    </span>
                  ) : (
                    <span className="cell-stack">
                      <span>{a.drip ?? 'First message goes out on the 1st'}</span>
                      <span className="muted">Nurturing since {a.when}</span>
                    </span>
                  )}
                </td>
                <td className="right">
                  <button type="button" className="btn btn--secondary btn--sm" data-tour={`reopen-${a.card.name}`} onClick={() => onReopen(a)}>
                    <Icon name="up" size={14} />
                    Reopen
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <div className="empty">
                    <b className="t-h3">{q ? 'No matches' : lost ? 'No lost leads' : 'Nobody in nurture'}</b>
                    <span className="muted">{lost ? 'Drag a card onto Lost on the pipeline board to close it with a reason.' : 'Drag a card onto Nurture to put it on the monthly WhatsApp message series.'}</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="panel__foot">
        Showing {rows.length} of {total} {lost ? 'lost this month' : 'in nurture'}.{' '}
        {lost ? 'Reasons feed the Leak finder.' : 'A nurtured lead comes back to Call now on its own when the buyer replies or shows new interest.'}
      </div>
    </>
  );
}

/** Reopen: pick the stage it returns to and say why (required, shown on the timeline). */
export function ReopenModal({ entry, onClose, onDone }: { entry: Archived; onClose: () => void; onDone?: () => void }) {
  const { reopen } = usePipeline();
  const { person } = useSession();
  const toast = useToast();
  const startAt = Math.max(0, REOPEN_STAGES.indexOf(entry.kind === 'nurture' ? 'Contacted' : entry.fromStage));
  const [stage, setStage] = useState(startAt);
  const [why, setWhy] = useState('');
  const [tried, setTried] = useState(false);

  const go = () => {
    setTried(true);
    if (!why.trim()) return;
    const undo = reopen(entry.id, stage, why.trim(), person.name);
    toast({ text: `${entry.card.name} is back in the pipeline · ${REOPEN_STAGES[stage]}`, action: { label: 'Undo', onClick: undo } });
    onClose();
    onDone?.();
  };

  return (
    <Modal
      title={`Reopen ${entry.card.name}`}
      sub={`${entry.kind === 'lost' ? `Lost from ${entry.fromStage} · ${entry.reason}` : `In nurture since ${entry.when} · ${entry.reason}`}`}
      onClose={onClose}
      actions={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={go} data-tour="reopen-confirm">
            Reopen lead
          </Button>
        </>
      }
    >
      <div className="field">
        <label htmlFor="ro-stage" className="field__label">
          Return to stage
        </label>
        <select id="ro-stage" className="select" value={stage} onChange={(e) => setStage(Number(e.target.value))}>
          {REOPEN_STAGES.map((s, i) => (
            <option key={s} value={i}>
              {s}
              {s === entry.fromStage ? ' (where it left)' : ''}
            </option>
          ))}
        </select>
        <span className="field__hint">Token and later need a booking, so reopen into an earlier stage and book from there.</span>
      </div>
      <div className="field">
        <label htmlFor="ro-why" className="field__label">
          Why it’s coming back (required)
        </label>
        <textarea
          id="ro-why"
          className="textarea"
          rows={3}
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          placeholder={entry.kind === 'lost' ? 'e.g. Called back after the price revision on floors 9–12' : 'e.g. Replied to the November update, ready to visit'}
          aria-invalid={tried && !why.trim()}
        />
        {tried && !why.trim() && <span className="field__error">Add a short note so the next agent knows the context.</span>}
      </div>
      <span className="small muted">Your note goes on the lead’s timeline and the SLA timer restarts at the chosen stage. Owner stays {entry.by === 'System' ? 'unassigned' : entry.by}.</span>
    </Modal>
  );
}
