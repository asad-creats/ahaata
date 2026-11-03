import { useState } from 'react';
import { Icon } from '../components/Icon';
import { Age, Avatar, Chip, DisabledWhy, FilterChip, Pagination, Skel, SourceTag, StageBadge, UnitTag } from '../components/ui';
import { RefPage } from './RefPage';

const BRAND = [
  ['brand-900', '#0D3B2E', '#0B241C', 'Top bar, headings on brand'],
  ['brand-600', '#11795A', '#3FB58A', 'Primary action, links, selection'],
  ['brand-50', '#E8F3EE', '#163328', 'Selected row, active nav'],
  ['accent-500', '#E3A72F', '#E3A72F', 'Focus ring, key highlight (sparingly)'],
  ['accent-text', '#7A4A00', '#F0C066', 'Accent as text (AA on white)'],
  ['danger', '#B42318', '#F08A78', 'Overdue, at risk, destructive'],
  ['warning', '#7A4A00', '#F0C066', 'Approaching SLA, hold expiring'],
  ['success', '#1C6B36', '#7EDBA3', 'Paid, on track, healthy'],
];
const NEUTRAL = [
  ['bg', '#F6F7F6', '#0F1412', 'App background'],
  ['surface', '#FFFFFF', '#161C19', 'Panels, tables'],
  ['surface-2', '#F4F5F4', '#1C2420', 'Table header, hover'],
  ['border', '#E1E5E3', '#2A332F', 'Dividers, panel edges'],
  ['border-strong', '#C9CFCC', '#3A4540', 'Inputs, secondary buttons'],
  ['text', '#141A17', '#E6EBE8', 'Primary text (16.8:1)'],
  ['text-muted', '#5C6661', '#9AA5A0', 'Meta, labels (5.9:1)'],
  ['text-disabled', '#7A847F', '#6B7570', 'Disabled + tooltip required'],
];
const SPACE = [
  ['4', 'Icon ↔ label'],
  ['8', 'Chip gaps, control groups'],
  ['12', 'Table cell padding'],
  ['16', 'Panel padding'],
  ['24', 'Between panels'],
  ['32', 'Page gutters'],
  ['48', 'Section breaks (docs only)'],
];
const TYPE = [
  ['32 / 40 · 700', 't-display', 'PKR 1.85 Cr'],
  ['24 / 32 · 600', 't-h1', 'Saffron Residencia'],
  ['20 / 28 · 600', 't-h2', 'Overdue follow-ups'],
  ['16 / 24 · 600', 't-h3', 'Ayesha Khan · B-504'],
  ['14 / 20 · 400', 't-body', 'Called, asked for 3-year plan on 2-bed. Visit Sat 11:00.'],
  ['12 / 16 · 500', 't-meta', 'Last touched by Usman Tariq · 2h ago'],
];

function TokenTable({ rows }: { rows: string[][] }) {
  return (
    <div className="panel panel--clip">
      <table className="dt dt--compact">
        <thead>
          <tr>
            <th>Token</th>
            <th>Light</th>
            <th>Dark</th>
            <th>Use</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([name, light, dark, use]) => (
            <tr key={name}>
              <td>
                <code style={{ fontFamily: 'var(--mono)' }}>{name}</code>
              </td>
              <td>
                <span className="row">
                  <span className="swatch" style={{ background: light }} />
                  {light}
                </span>
              </td>
              <td>
                <span className="row">
                  <span className="swatch" style={{ background: dark }} />
                  {dark}
                </span>
              </td>
              <td className="muted">{use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DesignSystem() {
  const [page, setPage] = useState(1);
  const [range, setRange] = useState('Last 30 days');
  return (
    <RefPage title="Tokens & components" sub="One brand colour, one accent, semantic colours only for meaning. Every token has a light and a dark value. Screens use only what is on this page.">
      <div className="row-wrap small muted">
        <span className="filter-chip" style={{ height: 'auto', padding: '4px 8px' }}>
          Inter · 12/14/16/20/24/32
        </span>
        <span className="filter-chip" style={{ height: 'auto', padding: '4px 8px' }}>
          4px grid
        </span>
        <span className="filter-chip" style={{ height: 'auto', padding: '4px 8px' }}>
          WCAG AA
        </span>
      </div>

      <section className="stack-4">
        <h2 className="t-h2">Colour</h2>
        <div className="ref-grid-2">
          <TokenTable rows={BRAND} />
          <TokenTable rows={NEUTRAL} />
        </div>
        <div className="ref-grid-2">
          <div className="panel stack-3" style={{ padding: 16 }}>
            <span className="t-label">Inventory status — fill + letter + pattern, never colour alone</span>
            <div className="row-wrap" style={{ gap: 12 }}>
              {(
                [
                  ['A', 'Available'],
                  ['H', 'On hold'],
                  ['B', 'Booked'],
                  ['S', 'Sold'],
                  ['N', 'Not released'],
                ] as const
              ).map(([k, l]) => (
                <span key={k} className="row">
                  <span className={`st st--${k}`} style={{ width: 40, height: 32 }}>
                    {k === 'N' ? '–' : k}
                  </span>
                  {l}
                </span>
              ))}
            </div>
          </div>
          <div className="panel stack-3" style={{ padding: 16 }}>
            <span className="t-label">Chart scales — sequential (demand) and two-series (views vs bookings)</span>
            <div className="row" style={{ gap: 0, borderRadius: 4, overflow: 'hidden' }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="spacer" style={{ height: 24, background: `var(--seq-${i})` }} />
              ))}
            </div>
            <div className="row-wrap small muted" style={{ gap: 16 }}>
              <span className="row" style={{ gap: 6 }}>
                <span className="legend-sq" style={{ background: 'var(--brand-600)' }} />
                Series 1 — brand
              </span>
              <span className="row" style={{ gap: 6 }}>
                <span className="legend-sq" style={{ background: 'var(--accent-500)' }} />
                Series 2 — accent
              </span>
              <span className="row" style={{ gap: 6 }}>
                <span className="legend-sq" style={{ background: 'var(--neutral-500)' }} />
                Comparison / previous period
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="ref-grid-2">
        <div className="stack-4">
          <h2 className="t-h2">Type — Inter, tabular numerals</h2>
          <div className="panel panel--clip">
            {TYPE.map(([spec, cls, sample]) => (
              <div key={spec} className="row list-row" style={{ alignItems: 'baseline', gap: 24 }}>
                <span className="small muted" style={{ width: 96, flex: 'none' }}>
                  {spec}
                </span>
                <span className={cls}>{sample}</span>
              </div>
            ))}
          </div>
          <p className="small muted" style={{ margin: 0 }}>
            Numbers: 1,25,000 (PKR lakh grouping) in tables · 85 lakh / 1.85 Cr in summaries · sizes 5 marla, 1 kanal, 1,150 sq ft, 120 sq yd. Urdu: Noto Nastaliq Urdu at +2px, line-height 1.8.
          </p>
        </div>
        <div className="stack-4">
          <h2 className="t-h2">Spacing, radius, elevation</h2>
          <div className="panel stack-2" style={{ padding: 16 }}>
            {SPACE.map(([n, use]) => (
              <div key={n} className="row" style={{ gap: 16 }}>
                <span className="small muted" style={{ width: 40 }}>
                  {n}
                </span>
                <span style={{ height: 12, width: `${n}px`, background: 'var(--brand-600)', borderRadius: 2 }} />
                <span className="small muted">{use}</span>
              </div>
            ))}
          </div>
          <div className="grid-tiles grid-tiles--3" style={{ gap: 16 }}>
            <div className="panel small" style={{ padding: 12, borderRadius: 6, borderColor: 'var(--border-strong)' }}>
              <b>6px</b>
              <br />
              <span className="muted">Controls, chips, inputs</span>
            </div>
            <div className="panel small" style={{ padding: 12, borderColor: 'var(--border-strong)' }}>
              <b>8px</b>
              <br />
              <span className="muted">Panels, drawers, modals</span>
            </div>
            <div className="panel panel--floating small" style={{ padding: 12 }}>
              <b>Shadow 1</b>
              <br />
              <span className="muted">Floating only: menus, toasts, drawers, modals, dragged card</span>
            </div>
          </div>
        </div>
      </section>

      <section className="stack-4">
        <h2 className="t-h2">Buttons &amp; inputs</h2>
        <div className="panel ds-btn-grid">
          <span />
          {['Default', 'Hover', 'Focus', 'Disabled'].map((h) => (
            <span key={h} className="t-label">
              {h}
            </span>
          ))}
          {(
            [
              ['Primary', 'primary', 'Assign lead'],
              ['Secondary', 'secondary', 'Export CSV'],
              ['Ghost', 'ghost', 'View history'],
              ['Destructive', 'danger', 'Mark as lost'],
            ] as const
          ).map(([label, v, text]) => (
            <div key={v} style={{ display: 'contents' }}>
              <span className="small muted">{label}</span>
              <div>
                <button type="button" className={`btn btn--${v}`}>
                  {text}
                </button>
              </div>
              <div>
                <button type="button" className={`btn btn--${v} is-hover`}>
                  {text}
                </button>
              </div>
              <div>
                <button type="button" className={`btn btn--${v}`} style={{ outline: 'var(--focus-ring)', outlineOffset: 2 }}>
                  {text}
                </button>
              </div>
              <div>
                {v === 'danger' ? (
                  <DisabledWhy reason="Only Owner/Admin can delete leads. Ask Sana Malik." lock={false}>
                    Delete lead
                  </DisabledWhy>
                ) : (
                  <button type="button" className={`btn btn--${v}`} disabled>
                    {text}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="panel ds-input-grid">
          <div className="field">
            <label htmlFor="ds-phone" className="field__label">
              Phone
            </label>
            <input id="ds-phone" className="input" defaultValue="+92 300 5123478" />
            <span className="field__hint">Pakistani mobile, auto-formatted</span>
          </div>
          <div className="field">
            <label htmlFor="ds-cnic" className="field__label">
              CNIC
            </label>
            <input id="ds-cnic" className="input" defaultValue="35202-1234567-" aria-invalid="true" aria-describedby="ds-cnic-err" />
            <span id="ds-cnic-err" className="field__error">
              <Icon name="info" size={12} stroke={2.5} />
              CNIC needs 13 digits
            </span>
          </div>
          <div className="field">
            <label htmlFor="ds-src" className="field__label">
              Source
            </label>
            <select id="ds-src" className="select">
              {['Facebook Lead Ads', 'Zameen', 'Graana', 'Dealer', 'Expo', 'Walk-in'].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <span className="field__label">Date range</span>
            <button type="button" className="input row" style={{ textAlign: 'left' }}>
              <Icon name="calendar" color="var(--text-muted)" />
              <span className="spacer">1 Oct – 31 Oct 2026</span>
              <span className="small muted">30d</span>
            </button>
          </div>
        </div>

        <div className="row-wrap" style={{ alignItems: 'flex-start', gap: 24 }}>
          <div className="panel panel--floating row" style={{ alignItems: 'stretch', overflow: 'hidden', gap: 0 }}>
            <div className="col" style={{ padding: 8, borderRight: '1px solid var(--border)', gap: 2, width: 140 }}>
              {['Today', 'Last 7 days', 'Last 30 days', 'This quarter', 'Custom'].map((r) => (
                <button key={r} type="button" className={`menu__item ${range === r ? 'is-active' : ''}`} style={{ minHeight: 32, borderRadius: 6, fontWeight: range === r ? 600 : 400 }} onClick={() => setRange(r)}>
                  {r}
                </button>
              ))}
            </div>
            <div className="stack-2" style={{ padding: 16, width: 252 }}>
              <div className="row strong" style={{ justifyContent: 'space-between' }}>
                <span>October 2026</span>
                <span className="muted">‹ ›</span>
              </div>
              <div className="cal">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i} className="muted">
                    {d}
                  </span>
                ))}
                <span />
                <span />
                {Array.from({ length: 31 }, (_, i) => i + 1).map((n) => (
                  <span key={n} className={`cal__day ${n === 1 || n === 31 ? 'is-edge' : 'is-range'}`}>
                    {n}
                  </span>
                ))}
              </div>
              <div className="row" style={{ justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                <button type="button" className="btn btn--ghost btn--sm">
                  Clear
                </button>
                <button type="button" className="btn btn--primary btn--sm">
                  Apply
                </button>
              </div>
            </div>
          </div>

          <div className="panel stack-4 spacer" style={{ padding: 16, minWidth: 320 }}>
            <span className="t-label">Status chips · stage badges with age · source tags · avatars</span>
            <div className="row-wrap">
              <Chip tone="ok" icon="check">
                Paid
              </Chip>
              <Chip tone="warn" icon="clock">
                Due in 3d
              </Chip>
              <Chip tone="bad" icon="warn">
                Overdue 14d
              </Chip>
              <Chip>Nurture</Chip>
            </div>
            <div className="row-wrap">
              <StageBadge stage="Visit scheduled" age="2d" />
              <StageBadge stage="Negotiation" age="6d" state="a" />
              <StageBadge stage="Payment plan shared" age="12d" state="r" />
              <Age state="r">21d</Age>
            </div>
            <div className="row-wrap">
              <SourceTag>Facebook</SourceTag>
              <SourceTag>Zameen</SourceTag>
              <SourceTag>Dealer · Al-Noor Estate</SourceTag>
              <UnitTag>B-504</UnitTag>
              <UnitTag>Plot C-114</UnitTag>
              <span className="divider-v" style={{ height: 24 }} />
              <Avatar initials="FA" variant="dark" title="Faraz Ahmed" />
              <Avatar initials="AK" title="Ayesha Khan" />
              <Avatar initials="?" title="Unassigned" />
            </div>
          </div>
        </div>
      </section>

      <section className="stack-4">
        <h2 className="t-h2">Filter bar, saved views, table, pagination</h2>
        <div className="panel panel--clip">
          <div className="tabs" role="tablist">
            <button type="button" role="tab" aria-selected="true" className="tab tab--40">
              My open leads <span className="tab__n">48</span>
            </button>
            <button type="button" role="tab" aria-selected="false" className="tab tab--40">
              Untouched &gt; 24h <span className="tab__n tab__n--alert">6</span>
            </button>
            <button type="button" role="tab" aria-selected="false" className="tab tab--40">
              Hot — Token this week
            </button>
            <button type="button" className="tab tab--40" style={{ color: 'var(--brand-link)', fontWeight: 600 }}>
              + Save view
            </button>
          </div>
          <div className="row-wrap" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <FilterChip label="Stage" value="Qualified, Visit scheduled" onRemove={() => {}} />
            <FilterChip label="Source" value="Facebook" onRemove={() => {}} />
            <button type="button" className="filter-add">
              + Filter
            </button>
            <span className="spacer" />
            <span className="small muted">Sticky header · sortable · bulk select</span>
          </div>
          <table className="dt dt--roomy">
            <thead>
              <tr>
                <th className="dt__check">
                  <input type="checkbox" aria-label="Select all" />
                </th>
                <th>Lead ↓</th>
                <th>Stage · age</th>
                <th>Unit of interest</th>
                <th>Owner</th>
                <th className="num">Budget</th>
              </tr>
            </thead>
            <tbody>
              <tr className="is-selected">
                <td className="dt__check">
                  <input type="checkbox" defaultChecked aria-label="Select Faraz Ahmed" />
                </td>
                <td>
                  <span className="cell-stack">
                    <b className="strong">Faraz Ahmed</b>
                    <span className="small muted">0300 512 3478 · Facebook</span>
                  </span>
                </td>
                <td>
                  Qualified <span className="small strong danger-text">· 9d</span>
                </td>
                <td>2-bed · B-504</td>
                <td>Usman Tariq</td>
                <td className="num">PKR 1.85 Cr</td>
              </tr>
              <tr>
                <td className="dt__check">
                  <input type="checkbox" aria-label="Select Ayesha Khan" />
                </td>
                <td>
                  <span className="cell-stack">
                    <b className="strong">Ayesha Khan</b>
                    <span className="small muted">0333 410 9921 · Zameen</span>
                  </span>
                </td>
                <td>
                  Visit scheduled <span className="small muted">· 1d</span>
                </td>
                <td>3-bed · C-1102</td>
                <td>Usman Tariq</td>
                <td className="num">PKR 2.40 Cr</td>
              </tr>
            </tbody>
          </table>
          <Pagination summary="1–50 of 1,284" page={page} pages={26} onPage={setPage} />
        </div>
      </section>

      <section className="stack-4">
        <h2 className="t-h2">Feedback &amp; overlays</h2>
        <div className="ref-grid-3">
          <div className="stack-3">
            <span className="t-label">Toasts (bottom-left, 6s, pause on hover)</span>
            <div role="status" className="toast">
              <Icon name="check" color="#5CC98A" stroke={2.5} />
              <span className="spacer">12 leads assigned to Usman Tariq</span>
              <button type="button" className="toast__action">
                Undo
              </button>
            </div>
            <div role="alert" className="toast toast--alert">
              <Icon name="info" color="var(--danger)" stroke={2.5} />
              <span className="spacer">
                <b>SLA in 4 min</b> · Bilal Hussain (Facebook) not yet called
              </span>
              <button type="button" className="btn btn--primary btn--sm">
                Call
              </button>
            </div>
          </div>
          <div className="stack-3">
            <span className="t-label">Modal — required lost reason</span>
            <div role="dialog" aria-label="Mark as lost" className="modal" style={{ padding: 24, gap: 16 }}>
              <div className="modal__title">Move Hamza Siddiqui to Lost?</div>
              <fieldset className="stack-2" style={{ border: 0, padding: 0, margin: 0 }}>
                <legend className="field__label" style={{ marginBottom: 8 }}>
                  Lost reason (required)
                </legend>
                {['Price too high for budget', 'Bought elsewhere', 'Not reachable after 5 attempts'].map((r, i) => (
                  <label key={r} className="check">
                    <input type="radio" name="ds-lr" defaultChecked={i === 0} /> {r}
                  </label>
                ))}
              </fieldset>
              <div className="modal__actions">
                <button type="button" className="btn btn--secondary">
                  Cancel
                </button>
                <button type="button" className="btn btn--danger">
                  Mark as lost
                </button>
              </div>
            </div>
          </div>
          <div className="stack-3">
            <span className="t-label">Side drawer (480px, right) — header, scroll body, sticky footer</span>
            <div className="panel panel--floating panel--clip col" style={{ height: 268 }}>
              <div className="row" style={{ padding: 16, borderBottom: '1px solid var(--border)', justifyContent: 'space-between' }}>
                <b className="t-h3">Unit B-504</b>
                <button type="button" className="close-x" aria-label="Close">
                  ×
                </button>
              </div>
              <div className="stack-2 text-2 spacer" style={{ padding: 16, gap: 6 }}>
                <span>2-bed · 1,150 sq ft · Floor 5 · East facing</span>
                <span>PKR 1.85 Cr · PKR 16,087 / sq ft</span>
                <span>
                  On hold for Faraz Ahmed · expires in <b className="warning-text">19h 40m</b>
                </span>
              </div>
              <div className="drawer__foot" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn--secondary">
                  Release hold
                </button>
                <button type="button" className="btn btn--primary">
                  Book unit
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="ref-grid-3">
          <div className="panel empty">
            <span className="t-label">Empty state</span>
            <Icon name="list" size={32} stroke={1.5} color="var(--text-muted)" />
            <b className="t-h3">No leads in this view</b>
            <span className="muted">Leads from Facebook Lead Ads appear here within a minute of submission.</span>
            <div className="row">
              <button type="button" className="btn btn--primary">
                Add lead
              </button>
              <button type="button" className="btn btn--secondary">
                Import CSV
              </button>
            </div>
          </div>
          <div className="panel stack-3" style={{ padding: 24 }} aria-busy="true">
            <span className="t-label">Skeleton (matches final layout, no spinner)</span>
            {[40, 55, 35, 48].map((w, i) => (
              <div key={i} className="row" style={{ gap: 12 }}>
                <Skel w={28} h={28} />
                <Skel w={`${w}%`} h={12} />
                <span className="spacer" />
                <Skel w={`${15 + i * 3}%`} h={12} />
              </div>
            ))}
          </div>
          <div className="panel stack-3" style={{ padding: 24, alignItems: 'flex-start' }}>
            <span className="t-label">Error state (inline, keeps the rest of the page usable)</span>
            <div role="alert" className="callout callout--danger" style={{ width: '100%', alignItems: 'flex-start' }}>
              <Icon name="warn" size={20} color="var(--danger)" />
              <div className="stack-1">
                <b>Couldn't load bookings</b>
                <span className="text-2">The server didn't respond in 10s. Your filters are kept.</span>
                <span className="small muted">Ref: req_8f21c · 14:32</span>
              </div>
            </div>
            <button type="button" className="btn btn--secondary">
              Try again
            </button>
          </div>
        </div>
      </section>

      <section className="stack-4">
        <h2 className="t-h2">Dark mode — same components, dark tokens</h2>
        <div className="theme-dark ds-dark">
          <div className="panel panel--clip" style={{ flex: '2 1 520px' }}>
            <table className="dt">
              <thead>
                <tr>
                  <th>Lead</th>
                  <th>Stage · age</th>
                  <th>Unit</th>
                  <th className="num">Budget</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="strong">Faraz Ahmed</td>
                  <td>
                    Negotiation <span className="small strong danger-text">· 12d</span>
                  </td>
                  <td>B-504</td>
                  <td className="num">PKR 1.85 Cr</td>
                </tr>
                <tr>
                  <td className="strong">Ayesha Khan</td>
                  <td>
                    Token <span className="small muted">· 1d</span>
                  </td>
                  <td>C-1102</td>
                  <td className="num">PKR 2.40 Cr</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="stack-3" style={{ flex: '1 1 280px' }}>
            <div className="row-wrap">
              <button type="button" className="btn btn--primary">
                Primary
              </button>
              <button type="button" className="btn btn--secondary">
                Secondary
              </button>
              <button type="button" className="btn btn--danger">
                Destructive
              </button>
            </div>
            <div className="row-wrap">
              <Chip tone="ok">Paid</Chip>
              <Chip tone="warn">Due in 3d</Chip>
              <Chip tone="bad">Overdue 14d</Chip>
            </div>
            <span className="small muted">Gold accent stays #E3A72F in both modes; focus ring is gold on both.</span>
          </div>
        </div>
      </section>
    </RefPage>
  );
}
