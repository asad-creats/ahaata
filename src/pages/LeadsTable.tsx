import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArchiveList, ReopenModal } from '../components/Archive';
import { usePipeline, type ArchiveKind, type Archived } from '../lib/pipelineStore';
import type { Card } from '../data/pipeline';
import { Icon } from '../components/Icon';
import { Age, DisabledWhy, FilterChip, Modal, Pagination, SourceTag, Button } from '../components/ui';
import { STAGES, LOST_REASONS } from '../data/pipeline';
import { AGENTS, LEADS, VIEWS, type LeadRow } from '../data/leads';
import { usePopover, digits } from '../lib/hooks';
import { useSession } from '../lib/session';
import { useToast } from '../lib/toast';

type SortKey = 'name' | 'days' | 'budget';
const TOTAL = 1284;

export function LeadsTable() {
  const s = useSession();
  const toast = useToast();
  const [rows, setRows] = useState<LeadRow[]>(LEADS);
  const [params] = useSearchParams();
  const [view, setView] = useState(params.get('view') ?? 'stuck');
  const { archive, lostCount, nurtureCount } = usePipeline();
  const [reopening, setReopening] = useState<Archived | null>(null);
  const [archiveQuery, setArchiveQuery] = useState('');
  const archiveView: ArchiveKind | null = view === 'lost' || view === 'nurture' ? view : null;
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState({ stage: true, owner: true });
  const [sel, setSel] = useState<Set<string>>(() => new Set(LEADS.slice(0, 3).map((r) => r.id)));
  const [allMatching, setAllMatching] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'days', dir: -1 });
  const [page, setPage] = useState(1);
  const [lostOpen, setLostOpen] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const lastClicked = useRef<number | null>(null);
  const assign = usePopover();
  const stage = usePopover();
  const addFilter = usePopover();
  const [notify, setNotify] = useState(true);
  const [agentPick, setAgentPick] = useState('Usman Tariq');

  const visible = useMemo(() => {
    const t = q.trim().toLowerCase();
    const d = digits(t);
    let out = rows.filter((r) => !t || r.name.toLowerCase().includes(t) || (d.length >= 3 && digits(r.phone).includes(d)));
    if (filters.stage) out = out.filter((r) => ['Qualified', 'Contacted', 'Visit scheduled', 'Visit done'].includes(r.stage));
    if (filters.owner) out = out.filter((r) => r.owner === 'Unassigned' || r.owner === 'Sana Naveed');
    const val = (r: LeadRow) => (sort.key === 'name' ? r.name : sort.key === 'budget' ? r.budgetPkr : r.days);
    return [...out].sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * sort.dir);
  }, [rows, q, filters, sort]);

  const count = allMatching ? TOTAL : sel.size;
  const pageAll = visible.length > 0 && visible.every((r) => sel.has(r.id));

  const toggleRow = (i: number, e: MouseEvent<HTMLInputElement>) => {
    const id = visible[i].id;
    setAllMatching(false);
    setSel((prev) => {
      const next = new Set(prev);
      // Shift-click selects a range.
      if (e.shiftKey && lastClicked.current !== null) {
        const [a, b] = [Math.min(lastClicked.current, i), Math.max(lastClicked.current, i)];
        const on = !prev.has(id);
        for (let k = a; k <= b; k++) (on ? next.add(visible[k].id) : next.delete(visible[k].id));
      } else if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    lastClicked.current = i;
  };

  const togglePage = () => {
    setAllMatching(false);
    setSel(pageAll ? new Set() : new Set(visible.map((r) => r.id)));
  };

  const sortBy = (key: SortKey) => setSort((x) => ({ key, dir: x.key === key ? (x.dir === 1 ? -1 : 1) : key === 'name' ? 1 : -1 }));
  const arrow = (key: SortKey) => (sort.key === key ? (sort.dir === -1 ? ' ↓' : ' ↑') : '');

  const doAssign = () => {
    const before = rows;
    const ids = new Set(sel);
    setRows((rs) => rs.map((r) => (allMatching || ids.has(r.id) ? { ...r, owner: agentPick, nextLate: false, next: 'Call today' } : r)));
    assign.setOpen(false);
    toast({ text: `${count.toLocaleString('en-US')} leads assigned to ${agentPick}${notify ? ' · notified on WhatsApp' : ''}`, action: { label: 'Undo', onClick: () => setRows(before) } });
    setSel(new Set());
    setAllMatching(false);
  };

  const toCard = (r: LeadRow): Card => ({
    id: `lt-${r.id}`,
    name: r.name,
    unit: r.unit,
    src: r.src,
    owner: r.owner === 'Unassigned' ? '?' : r.owner.split(' ').map((w) => w[0]).join(''),
    budget: r.budget,
    age: r.age,
    st: r.st,
  });

  /** Move the selected rows off the open list into Lost or Nurture, with one undo for all. */
  const archiveSelected = (kind: ArchiveKind, reason: string) => {
    const ids = new Set(sel);
    const picked = rows.filter((r) => allMatching || ids.has(r.id));
    const before = rows;
    const undos = picked.map((r) => archive({ card: toCard(r), kind, fromStage: r.stage, reason, by: s.person.name }));
    setRows((rs) => rs.filter((r) => !picked.includes(r)));
    setSel(new Set());
    setAllMatching(false);
    toast({
      text: `${count.toLocaleString('en-US')} leads ${kind === 'lost' ? `marked as lost · ${reason}` : 'moved to Nurture'}`,
      action: {
        label: 'Undo',
        onClick: () => {
          undos.forEach((u) => u());
          setRows(before);
        },
      },
    });
  };

  const doStage = (to: string) => {
    stage.setOpen(false);
    if (to === 'Nurture') {
      archiveSelected('nurture', 'Moved in bulk · not ready yet');
      return;
    }
    if (to === 'Lost') {
      setLostReason('');
      setLostOpen(true);
      return;
    }
    const ids = new Set(sel);
    setRows((rs) => rs.map((r) => (allMatching || ids.has(r.id) ? { ...r, stage: to, age: '0d', days: 0, st: 'g' } : r)));
    toast({ text: `${count.toLocaleString('en-US')} leads moved to ${to}` });
  };

  const isAdmin = s.role === 'admin';
  const title = s.role === 'dealer' ? 'My referrals' : s.role === 'agent' ? 'My leads' : 'Leads';

  return (
    <>
      <div className="page-head">
        <h1 className="t-h1">{title}</h1>
        <span className="muted">
          {TOTAL.toLocaleString('en-US')} match · {s.project}
        </span>
        <span className="spacer" />
        <button type="button" className="btn btn--secondary btn--sm">
          Import CSV
        </button>
        <button type="button" className="btn btn--primary btn--sm">
          Add lead
        </button>
      </div>

      <div className="panel" style={{ display: 'flex', flexDirection: 'column' }}>
        <div role="tablist" aria-label="Saved views" className="tabs">
          {VIEWS.map((v) => (
            <button key={v.key} type="button" role="tab" aria-selected={view === v.key} className="tab" onClick={() => setView(v.key)}>
              {v.team && <Icon name="users" size={14} label="Shared with team" />}
              {v.label} <span className={`tab__n ${v.alert ? 'tab__n--alert' : ''}`}>{v.n}</span>
            </button>
          ))}
          <span className="divider-v" aria-hidden="true" />
          <button type="button" role="tab" aria-selected={view === 'lost'} className="tab" data-tour="view-tab-lost" onClick={() => setView('lost')}>
            Lost <span className="tab__n">{lostCount}</span>
          </button>
          <button type="button" role="tab" aria-selected={view === 'nurture'} className="tab" onClick={() => setView('nurture')}>
            Nurture <span className="tab__n">{nurtureCount}</span>
          </button>
          <button type="button" className="tab" style={{ color: 'var(--brand-link)', fontWeight: 600 }} onClick={() => toast({ text: 'View saved to “My views”. Managers can publish it to the team.' })}>
            + Save current view
          </button>
        </div>

        {archiveView ? (
          <>
            <div className="row-wrap" style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
              <label className="search" style={{ minWidth: 220 }}>
                <Icon name="search" size={14} />
                <input aria-label={`Search ${archiveView} leads`} placeholder="Name or reason" value={archiveQuery} onChange={(e) => setArchiveQuery(e.target.value)} />
              </label>
              <span className="spacer" />
              <span className="small muted">{archiveView === 'lost' ? 'Closed deals with their reason' : 'On the monthly WhatsApp message series'}</span>
            </div>
            <ArchiveList kind={archiveView} query={archiveQuery} onReopen={setReopening} />
          </>
        ) : (
          <>
        {count > 0 && (
          <div className="bulkbar" role="region" aria-label="Bulk actions">
            <span className="strong" style={{ padding: '0 4px' }}>
              {count.toLocaleString('en-US')} selected
            </span>
            {!allMatching && (
              <button type="button" className="bulkbar__link" onClick={() => setAllMatching(true)}>
                Select all {TOTAL.toLocaleString('en-US')}
              </button>
            )}
            <span className="divider-v" style={{ background: 'var(--brand-700)' }} />
            <div style={{ position: 'relative' }} ref={assign.ref}>
              <button type="button" className="btn btn--sm bulkbar__primary" data-tour="assign" aria-expanded={assign.open} onClick={assign.toggle}>
                Assign to…
              </button>
              {assign.open && (
                <div role="menu" aria-label="Assign to" className="menu" style={{ top: 38, left: 0, width: 320 }}>
                  <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                    <input aria-label="Find agent" placeholder="Find agent" className="input input--sm" style={{ width: '100%' }} />
                  </div>
                  <div className="menu__label row" style={{ justifyContent: 'space-between' }}>
                    <span>Agent</span>
                    <span>Open leads · overdue</span>
                  </div>
                  {AGENTS.map((a) => (
                    <button key={a.name} type="button" role="menuitemradio" aria-checked={agentPick === a.name} disabled={a.off} className="menu__item" style={{ height: 44 }} onClick={() => setAgentPick(a.name)}>
                      <span className="avatar avatar--24">{a.ini}</span>
                      <span className="col spacer" style={{ lineHeight: '16px' }}>
                        <span className="strong">{a.name}</span>
                        <span className="small muted">{a.note}</span>
                      </span>
                      <span className="small">{a.load}</span>
                    </button>
                  ))}
                  <div className="row" style={{ padding: '10px 12px', borderTop: '1px solid var(--border)' }}>
                    <label className="check small spacer">
                      <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} /> Notify on WhatsApp
                    </label>
                    <button type="button" className="btn btn--primary btn--sm" onClick={doAssign}>
                      Assign {count.toLocaleString('en-US')}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div style={{ position: 'relative' }} ref={stage.ref}>
              <button type="button" className="btn btn--sm bulkbar__btn" aria-expanded={stage.open} onClick={stage.toggle}>
                Change stage
              </button>
              {stage.open && (
                <div role="menu" className="menu" style={{ top: 38, left: 0, maxHeight: 360, overflowY: 'auto' }}>
                  {[...STAGES.slice(0, 8), 'Nurture', 'Lost'].map((st) => (
                    <button key={st} type="button" role="menuitem" className="menu__item" onClick={() => doStage(st)}>
                      {st}
                      {st === 'Lost' && <span className="small muted">· reason required</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="button" className="btn btn--sm bulkbar__btn">
              Add tag
            </button>
            <button type="button" className="btn btn--sm bulkbar__btn">
              Export
            </button>
            {isAdmin ? (
              <button type="button" className="btn btn--sm bulkbar__btn">
                Delete
              </button>
            ) : (
              <DisabledWhy reason="Only Owner/Admin can delete leads. Ask Sana Malik." size="sm" variant="ghost">
                Delete
              </DisabledWhy>
            )}
            <span className="spacer" />
            <button
              type="button"
              className="btn btn--sm"
              style={{ color: '#fff' }}
              aria-label="Clear selection"
              onClick={() => {
                setSel(new Set());
                setAllMatching(false);
              }}
            >
              Clear
            </button>
          </div>
        )}

        {pageAll && !allMatching && visible.length > 0 && (
          <div className="callout callout--brand" style={{ borderRadius: 0, border: 0, borderBottom: '1px solid var(--brand-tint-border)' }}>
            <span>
              All <b>{visible.length}</b> leads on this page are selected.
            </span>
            <button type="button" className="btn btn--ghost btn--xs" onClick={() => setAllMatching(true)}>
              Select all {TOTAL.toLocaleString('en-US')} matching this view
            </button>
          </div>
        )}

        <div className="row-wrap" style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
          <label className="search" style={{ minWidth: 180 }}>
            <Icon name="search" size={14} />
            <input aria-label="Search leads" placeholder="Name, phone, CNIC" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          {filters.stage && <FilterChip on label="Stage" value="Qualified +3" onRemove={() => setFilters((f) => ({ ...f, stage: false }))} />}
          {filters.owner && <FilterChip on label="Owner" value="Unassigned, Sana N." onRemove={() => setFilters((f) => ({ ...f, owner: false }))} />}
          <FilterChip label="Created" value="Last 30 days" />
          <div style={{ position: 'relative' }} ref={addFilter.ref}>
            <button type="button" className="filter-add" aria-expanded={addFilter.open} onClick={addFilter.toggle}>
              + Filter
            </button>
            {addFilter.open && (
              <div role="menu" className="menu" style={{ top: 38, left: 0 }}>
                {[
                  ['Stage', () => setFilters((f) => ({ ...f, stage: true }))],
                  ['Owner', () => setFilters((f) => ({ ...f, owner: true }))],
                  ['Source', () => toast({ text: 'Source filter: pick Facebook, Zameen, Graana, Expo, Dealer or Walk-in' })],
                  ['Budget', () => toast({ text: 'Budget filter: set a PKR range' })],
                ].map(([l, fn]) => (
                  <button key={l as string} type="button" role="menuitem" className="menu__item" onClick={() => { (fn as () => void)(); addFilter.setOpen(false); }}>
                    {l as string}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="spacer" />
          <button type="button" className="btn btn--ghost btn--sm">
            Columns
          </button>
        </div>

        <div className="table-scroll--y" style={{ maxHeight: 720 }}>
          <table className="dt" style={{ minWidth: 1060 }}>
            <thead>
              <tr>
                <th className="dt__check">
                  <input type="checkbox" aria-label="Select page" checked={pageAll} onChange={togglePage} />
                </th>
                <th aria-sort={sort.key === 'name' ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}>
                  <button type="button" className={sort.key === 'name' ? 'is-sorted' : ''} onClick={() => sortBy('name')}>
                    Lead{arrow('name')}
                  </button>
                </th>
                <th aria-sort={sort.key === 'days' ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}>
                  <button type="button" className={sort.key === 'days' ? 'is-sorted' : ''} onClick={() => sortBy('days')}>
                    Stage · days{arrow('days')}
                  </button>
                </th>
                <th>Source</th>
                <th>Interest</th>
                <th className="num" aria-sort={sort.key === 'budget' ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}>
                  <button type="button" className={sort.key === 'budget' ? 'is-sorted' : ''} onClick={() => sortBy('budget')}>
                    Budget{arrow('budget')}
                  </button>
                </th>
                <th>Owner</th>
                <th>Last touched</th>
                <th>Next step</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r, i) => {
                const on = allMatching || sel.has(r.id);
                const unassigned = r.owner === 'Unassigned';
                return (
                  <tr key={r.id} className={on ? 'is-selected' : undefined}>
                    <td className="dt__check">
                      <input type="checkbox" checked={on} aria-label={`Select ${r.name}`} onClick={(e) => toggleRow(i, e)} onChange={() => {}} />
                    </td>
                    <td>
                      <span className="cell-stack">
                        <Link to="/leads/L-20931" className="cell-link ellipsis" title={r.name} style={{ maxWidth: 220 }}>
                          {r.name}
                        </Link>
                        <span className="small muted">{r.phone}</span>
                      </span>
                    </td>
                    <td className="nowrap">
                      <span className="row" style={{ gap: 6 }}>
                        {r.stage}
                        <Age state={r.st} icon={false}>
                          {r.age}
                        </Age>
                      </span>
                    </td>
                    <td>
                      <SourceTag>{r.src}</SourceTag>
                    </td>
                    <td className="small">{r.unit}</td>
                    <td className="num nowrap">{r.budget}</td>
                    <td className="nowrap" style={unassigned ? { color: 'var(--danger)', fontStyle: 'italic' } : undefined}>{r.owner}</td>
                    <td>
                      <span className="cell-stack small">
                        <span>{r.touch}</span>
                        <span className="muted">{r.touchBy}</span>
                      </span>
                    </td>
                    <td className="small" style={r.nextLate ? { color: 'var(--danger)', fontWeight: 600 } : undefined}>
                      {r.next}
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="empty">
                      <Icon name="list" size={32} stroke={1.5} color="var(--text-muted)" />
                      <b className="t-h3">No leads in this view</b>
                      <span className="muted">Try removing a filter. Leads from Facebook Lead Ads appear here within a minute of submission.</span>
                      <button type="button" className="btn btn--secondary" onClick={() => { setQ(''); setFilters({ stage: false, owner: false }); }}>
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination summary={`Showing ${(page - 1) * 50 + 1}–${Math.min(page * 50, TOTAL)} of ${TOTAL.toLocaleString('en-US')} · 50 per page`} page={page} pages={26} onPage={setPage} />
          </>
        )}
      </div>

      {reopening && <ReopenModal entry={reopening} onClose={() => setReopening(null)} />}

      {lostOpen && (
        <Modal
          title={`Move ${count.toLocaleString('en-US')} leads to Lost?`}
          sub="One lost reason is applied to all selected leads."
          onClose={() => setLostOpen(false)}
          actions={
            <>
              <Button onClick={() => setLostOpen(false)}>Cancel</Button>
              <Button
                variant="danger"
                disabled={!lostReason}
                onClick={() => {
                  setLostOpen(false);
                  archiveSelected('lost', lostReason);
                }}
              >
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
              <label key={r} className={`lost-reason ${lostReason === r ? 'is-on' : ''}`}>
                <input type="radio" name="bulk-lost" checked={lostReason === r} onChange={() => setLostReason(r)} /> {r}
              </label>
            ))}
          </fieldset>
        </Modal>
      )}
    </>
  );
}
