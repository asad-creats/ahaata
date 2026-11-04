import { Fragment, useMemo, useState, type MouseEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { Button, Chip, DisabledWhy } from '../components/ui';
import { BANDS, STATUS_LABEL, TYPES, buildTower, fmtLakh, fmtShort, type Status, type Unit } from '../data/inventory';
import { useSession } from '../lib/session';
import { useToast } from '../lib/toast';

const TOWERS = [
  { key: 'A', label: 'Tower A' },
  { key: 'B', label: 'Tower B' },
  { key: 'C', label: 'Tower C' },
  { key: 'G', label: 'Commercial (G–2)' },
];

export function Inventory() {
  const s = useSession();
  const toast = useToast();
  const [params] = useSearchParams();
  const [tower, setTower] = useState('B');
  const [show, setShow] = useState<'price' | 'size' | 'views'>('price');
  const [statusOn, setStatusOn] = useState<Record<Status, boolean>>({ A: true, H: true, B: true, S: true });
  const [overrides, setOverrides] = useState<Record<string, Partial<Unit>>>({});
  const [selCode, setSelCode] = useState<string | null>(params.get('unit') ?? 'B-504');
  const [multi, setMulti] = useState<string[]>([]);
  const [bands, setBands] = useState(BANDS);
  const [view, setView] = useState<'grid' | 'prices'>('grid');

  const floors = useMemo(() => buildTower(tower).map((row) => row.map((u) => ({ ...u, ...overrides[u.code] }))), [tower, overrides]);
  const all = floors.flat();
  const counts = all.reduce<Record<Status, number>>((c, u) => ({ ...c, [u.status]: c[u.status] + 1 }), { A: 0, H: 0, B: 0, S: 0 });
  const sel = all.find((u) => u.code === selCode) ?? null;

  const readOnly = s.role === 'dealer' || s.role === 'finance';
  const isManager = s.role === 'manager' || s.role === 'admin';
  const changes = bands.filter((b) => b.next !== b.old).length;

  const clickUnit = (u: Unit, e: MouseEvent) => {
    // Shift-click: select several for bulk hold or price change.
    if (e.shiftKey) {
      setMulti((m) => (m.includes(u.code) ? m.filter((c) => c !== u.code) : [...m, u.code]));
      return;
    }
    setMulti([]);
    setSelCode(u.code);
  };

  const patch = (code: string, p: Partial<Unit>) => setOverrides((o) => ({ ...o, [code]: { ...o[code], ...p } }));

  const cellText = (u: Unit) => (u.status === 'S' ? 'Sold' : show === 'size' ? `${u.size.toLocaleString('en-US')} ft²` : show === 'views' ? `${(u.floor * 3 + u.size / 60) | 0} views` : fmtShort(u.price));

  return (
    <>
      <div className="page-head">
        <nav aria-label="Breadcrumb" className="row" style={{ gap: 6 }}>
          <a href="#project">{s.project}</a>
          <span className="muted">/</span>
          <h1 className="t-h1">{TOWERS.find((t) => t.key === tower)?.label}</h1>
        </nav>
        <span className="muted">14 floors · {all.length} units · Price list v7 (since 1 Oct)</span>
        <span className="spacer" />
        <button type="button" className="btn btn--secondary btn--sm">
          Export price list PDF
        </button>
        {s.role === 'admin' ? (
          <button type="button" className="btn btn--primary btn--sm" onClick={() => setView('prices')}>
            Edit price list
          </button>
        ) : (
          <DisabledWhy reason="Only Owner/Admin can edit the price list" size="sm">
            Edit price list
          </DisabledWhy>
        )}
      </div>

      <div role="tablist" aria-label="Inventory views" className="tabs tabs--flush">
        <button type="button" role="tab" aria-selected={view === 'grid'} className="tab tab--40" onClick={() => setView('grid')}>
          Units
        </button>
        <button type="button" role="tab" aria-selected={view === 'prices'} className="tab tab--40" data-tour="tab-prices" onClick={() => setView('prices')}>
          Price list {changes > 0 && <span className="tab__n" style={{ color: 'var(--warning)' }}>draft v8</span>}
        </button>
      </div>

      <div className="row-wrap">
        <div role="tablist" aria-label="Blocks and towers" className="seg">
          {TOWERS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tower === t.key}
              onClick={() => {
                setTower(t.key);
                setSelCode(null);
                setMulti([]);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <span style={{ width: 8 }} />
        {view === 'grid' && (['A', 'H', 'B', 'S'] as Status[]).map((k) => (
          <button key={k} type="button" aria-pressed={statusOn[k]} className={`filter-chip legend-btn ${statusOn[k] ? '' : 'is-off'}`} onClick={() => setStatusOn((x) => ({ ...x, [k]: !x[k] }))}>
            <span className={`st st-swatch st--${k}`} style={k === 'H' ? { background: 'var(--st-hold-solid)' } : undefined}>
              {k}
            </span>
            {STATUS_LABEL[k]} <b>{counts[k]}</b>
          </button>
        ))}
        <span className="spacer" />
        {view === 'grid' && <label className="row small text-2" style={{ gap: 6 }}>
          Show
          <select className="select select--sm" value={show} onChange={(e) => setShow(e.target.value as typeof show)}>
            <option value="price">Price</option>
            <option value="size">Size</option>
            <option value="views">Views (30d)</option>
          </select>
        </label>}
      </div>

      {view === 'grid' && <div className="split">
        <section aria-label="Unit grid" className="panel" style={{ flex: '999 1 640px', minWidth: 0, padding: 12, overflowX: 'auto' }}>
          {multi.length > 0 && (
            <div className="callout callout--brand" style={{ marginBottom: 12 }}>
              <span className="callout__text">
                <b>{multi.length} units</b> selected: {multi.join(', ')}
              </span>
              {readOnly ? null : (
                <>
                  <Button size="sm" onClick={() => { multi.forEach((c) => patch(c, { status: 'H', holdFor: 'Bulk hold', holdBy: s.person.name, holdLeft: '48h 00m' })); toast({ text: `${multi.length} units held for 48h` }); setMulti([]); }}>
                    Hold 48h
                  </Button>
                  {s.role === 'admin' && <Button size="sm">Change price</Button>}
                </>
              )}
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setMulti([])}>
                Clear
              </button>
            </div>
          )}
          <div className="unit-grid">
            <span />
            {TYPES.map(([t], i) => (
              <span key={i} className="unit-grid__col">
                0{i + 1}
                <br />
                {t}
              </span>
            ))}
            {floors.map((row) => (
              <Fragment key={row[0].floor}>{renderRow(row)}</Fragment>
            ))}
          </div>
          <div className="row-wrap small muted" style={{ gap: 16, paddingTop: 12 }}>
            <span>Hover: size · price/sq ft · facing · hold owner</span>
            <span>Click: open unit panel</span>
            <span>Shift-click: select several for bulk hold or price change</span>
          </div>
        </section>

        {sel && (
          <aside aria-label={`Unit ${sel.code}`} className="panel panel--floating unit-panel">
            <div className="drawer__head">
              <div className="spacer">
                <div className="t-h2">{sel.code}</div>
                <div className="small muted">
                  {TOWERS.find((t) => t.key === tower)?.label} · Floor {sel.floor} · {sel.type} · {sel.facing}
                </div>
              </div>
              <button type="button" className="close-x" aria-label="Close unit panel" onClick={() => setSelCode(null)}>
                ×
              </button>
            </div>
            <div className="drawer__body">
              {sel.status === 'H' && (
                <div className="callout callout--warning" style={{ alignItems: 'center' }}>
                  <Icon name="clock" />
                  <div className="col small" style={{ lineHeight: '16px' }}>
                    <b>On hold · expires in {sel.holdLeft}</b>
                    <span>
                      For {sel.holdFor} by {sel.holdBy}
                      {s.role === 'dealer' ? '' : ' · Wed 4 Nov, 10:00'}
                    </span>
                  </div>
                </div>
              )}
              {sel.status !== 'H' && (
                <Chip tone={sel.status === 'A' ? 'ok' : 'plain'} icon={sel.status === 'A' ? 'check' : undefined}>
                  {STATUS_LABEL[sel.status]}
                </Chip>
              )}
              <div className="unit-facts">
                <div className="kv">
                  <span>List price</span>
                  <b className="t-h3">{sel.status === 'S' ? '—' : `PKR ${fmtShort(sel.price)}`}</b>
                </div>
                <div className="kv">
                  <span>Rate</span>
                  <b className="t-h3">{fmtLakh(Math.round(sel.price / sel.size))} / sq ft</b>
                </div>
                <div className="kv">
                  <span>Covered area</span>
                  <span>{sel.size.toLocaleString('en-US')} sq ft</span>
                </div>
                <div className="kv">
                  <span>Parking</span>
                  <span>1 covered (P2-{sel.floor + 13})</span>
                </div>
                <div className="kv">
                  <span>Interest (30d)</span>
                  <span>41 views · 6 visits · 3 quotes</span>
                </div>
                <div className="kv">
                  <span>Holds history</span>
                  <span>2 previous, both expired</span>
                </div>
              </div>
              {sel.status === 'H' || sel.status === 'A' ? (
                <div className="field">
                  <span className="field__label">{sel.status === 'H' ? 'Extend hold' : 'Hold for a lead'}</span>
                  <div role="group" aria-label="Hold for" className="row" style={{ gap: 6 }}>
                    {['24h', '48h'].map((h) =>
                      readOnly ? (
                        <DisabledWhy key={h} reason={s.role === 'dealer' ? 'Dealers request holds through their Sales Manager' : 'Finance has view-only inventory'} fill lock={false}>
                          +{h}
                        </DisabledWhy>
                      ) : (
                        <button
                          key={h}
                          type="button"
                          className="btn btn--secondary btn--fill"
                          style={{ fontWeight: 500 }}
                          onClick={() => {
                            patch(sel.code, { status: 'H', holdFor: sel.holdFor ?? 'Faraz Ahmed', holdBy: sel.holdBy ?? s.person.name, holdLeft: h === '24h' ? '23h 59m' : '47h 59m' });
                            toast({ text: `${sel.code} held for ${h}. You’ll be notified 2h before it expires.` });
                          }}
                        >
                          +{h}
                        </button>
                      ),
                    )}
                    {isManager ? (
                      <button type="button" className="btn btn--secondary btn--fill" style={{ fontWeight: 500 }} onClick={() => patch(sel.code, { status: 'H', holdLeft: '71h 59m', holdFor: sel.holdFor ?? 'Faraz Ahmed', holdBy: sel.holdBy ?? s.person.name })}>
                        +72h
                      </button>
                    ) : (
                      <DisabledWhy reason="Holds longer than 72h need Sales Manager approval" fill lock={false}>
                        +72h
                      </DisabledWhy>
                    )}
                  </div>
                  {!isManager && <span className="field__hint">Holds over 72h need Sales Manager approval.</span>}
                </div>
              ) : null}
            </div>
            <div className="drawer__foot">
              {sel.status === 'H' && !readOnly && (
                <Button
                  onClick={() => {
                    patch(sel.code, { status: 'A', holdFor: undefined, holdBy: undefined, holdLeft: undefined });
                    toast({ text: `Hold on ${sel.code} released · unit is Available` });
                  }}
                >
                  Release
                </Button>
              )}
              <Button>Payment plan</Button>
              {readOnly || sel.status === 'B' || sel.status === 'S' ? (
                <DisabledWhy reason={sel.status === 'B' || sel.status === 'S' ? 'Booked and sold units can’t be booked again' : 'Only sales staff can book units'} variant="primary" fill>
                  Book unit
                </DisabledWhy>
              ) : (
                <Button
                  variant="primary"
                  className="btn--fill"
                  onClick={() => {
                    patch(sel.code, { status: 'B', holdLeft: undefined });
                    toast({ text: `${sel.code} booked · Finance will confirm the token receipt` });
                  }}
                >
                  Book unit
                </Button>
              )}
            </div>
          </aside>
        )}
      </div>}

      {view === 'prices' && <section id="price-list" aria-labelledby="h-pl" className="panel panel--clip">
        <div className="panel__head">
          <h2 id="h-pl" className="panel__title">
            Price list editor — {TOWERS.find((t) => t.key === tower)?.label}
          </h2>
          {changes > 0 && <Chip tone="warn">Draft v8 · {changes} changes</Chip>}
          <span className="spacer" />
          <label className="row small" style={{ gap: 6 }}>
            Effective from <input className="input input--sm" style={{ width: 120 }} defaultValue="15 Nov 2026" disabled={s.role !== 'admin'} />
          </label>
          <button type="button" className="btn btn--ghost btn--sm">
            Compare with v7
          </button>
          {s.role === 'admin' ? (
            <button type="button" className="btn btn--primary btn--sm" onClick={() => toast({ text: 'Price list v8 published · audit logged · effective 15 Nov 2026' })}>
              Publish v8
            </button>
          ) : (
            <DisabledWhy reason="Only Owner/Admin can publish price lists. Ask Sana Malik." size="sm" variant="primary">
              Publish v8
            </DisabledWhy>
          )}
        </div>
        <div className="table-scroll">
          <table className="dt" style={{ minWidth: 820 }}>
            <thead>
              <tr>
                <th>Floor band</th>
                <th className="num">Rate / sq ft (v7)</th>
                <th className="num">Rate / sq ft (v8)</th>
                <th className="num">Studio 520</th>
                <th className="num">2-bed 1,150</th>
                <th className="num">3-bed 1,620</th>
                <th>Premiums</th>
              </tr>
            </thead>
            <tbody>
              {bands.map((b, i) => {
                const changed = b.next !== b.old;
                return (
                  <tr key={b.band}>
                    <td className="strong">{b.band}</td>
                    <td className="num muted">{fmtLakh(b.old)}</td>
                    <td className="num" style={{ paddingTop: 6, paddingBottom: 6 }}>
                      <input
                        aria-label={`New rate ${b.band}`}
                        className={`input input--sm rate-input ${changed ? 'is-changed' : ''}`}
                        value={fmtLakh(b.next)}
                        disabled={s.role !== 'admin'}
                        inputMode="numeric"
                        onChange={(e) => {
                          const n = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0;
                          setBands((bs) => bs.map((x, j) => (j === i ? { ...x, next: n } : x)));
                        }}
                      />
                    </td>
                    <td className="num">{fmtShort(520 * b.next)}</td>
                    <td className="num">{fmtShort(1150 * b.next)}</td>
                    <td className="num">{fmtShort(1620 * b.next)}</td>
                    <td className="small text-2">{b.prem}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="panel__foot">Units already on hold keep their quoted price until the hold expires. Booked and sold units are never repriced.</div>
      </section>}
    </>
  );

  function renderRow(row: Unit[]) {
    return (
      <>
        <span className="unit-grid__floor">F{row[0].floor}</span>
        {row.map((u) => {
          const dim = !statusOn[u.status];
          const tip = `${u.code} · ${u.type} · ${u.size.toLocaleString('en-US')} sq ft · ${u.facing}${u.status === 'S' ? '' : ` · PKR ${fmtShort(u.price)} · ${fmtLakh(Math.round(u.price / u.size))}/sq ft`}${u.status === 'H' ? ` · held by ${u.holdBy} for ${u.holdFor}, ${u.holdLeft} left` : ''}`;
          return (
            <button
              key={u.code}
              type="button"
              title={tip}
              aria-label={`${u.code}, ${u.type}, ${STATUS_LABEL[u.status]}${u.status === 'S' ? '' : `, PKR ${fmtShort(u.price)}`}`}
              aria-pressed={u.code === selCode || multi.includes(u.code)}
              data-tour={`unit-${u.code}`}
              className={`st unit-cell st--${u.status} ${u.code === selCode || multi.includes(u.code) ? 'st--sel' : ''}`}
              style={{ opacity: dim ? 0.25 : 1 }}
              onClick={(e) => clickUnit(u, e)}
            >
              <span className="unit-cell__top">
                {u.code}
                <span>{u.status}</span>
              </span>
              <span className="unit-cell__val">{cellText(u)}</span>
            </button>
          );
        })}
      </>
    );
  }
}
