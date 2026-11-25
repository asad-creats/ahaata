import type { KeyboardEvent } from 'react';
import { STATUS_LABEL, floorName, fmtShort, type Status, type Unit } from '../data/inventory';

/**
 * Site plan of the project for presenting stock to a developer or agency:
 * buildings drawn in place with what's left in each, and a side view of the
 * selected building showing every flat by status.
 */

export type MapTower = { key: string; label: string; floors: Unit[][] };

const ORDER: Status[] = ['S', 'B', 'H', 'A'];

/** Where each building sits on the plan (viewBox 0 0 640 420). */
const PLACE: Record<string, { x: number; y: number; w: number; h: number }> = {
  A: { x: 40, y: 40, w: 220, h: 120 },
  B: { x: 40, y: 196, w: 220, h: 128 },
  C: { x: 356, y: 40, w: 224, h: 120 },
  G: { x: 356, y: 212, w: 150, h: 112 },
};

const FILL: Record<Status, string> = {
  S: 'var(--st-sold-bg)',
  B: 'var(--st-booked-bg)',
  H: 'var(--st-hold-solid)',
  A: 'var(--st-available-bg)',
};

function tally(units: Unit[]) {
  const n: Record<Status, number> = { A: 0, H: 0, B: 0, S: 0 };
  let unsold = 0;
  for (const u of units) {
    n[u.status]++;
    if (u.status === 'A' || u.status === 'H') unsold += u.price;
  }
  return { n, unsold, total: units.length };
}

const cr = (p: number) => `PKR ${(p / 10000000).toLocaleString('en-US', { maximumFractionDigits: 0 })} Cr`;

export function SiteMap({
  project,
  towers,
  selected,
  onSelect,
  onOpenUnit,
}: {
  project: string;
  towers: MapTower[];
  selected: string;
  onSelect: (key: string) => void;
  onOpenUnit: (tower: string, code: string) => void;
}) {
  const all = tally(towers.flatMap((t) => t.floors.flat()));
  const cur = towers.find((t) => t.key === selected) ?? towers[0];
  const curT = tally(cur.floors.flat());

  const keyPick = (key: string) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(key);
    }
  };

  return (
    <div className="stack-4">
      <section className="panel sitemap-totals" aria-label="Whole project">
        <div className="sitemap-total">
          <span className="t-label">{project}</span>
          <b>{all.total} units</b>
        </div>
        {ORDER.map((k) => (
          <div key={k} className="sitemap-total">
            <span className="t-label">
              <i className={`sitemap-sw sitemap-sw--${k}`} aria-hidden="true" /> {STATUS_LABEL[k]}
            </span>
            <b>{all.n[k]}</b>
          </div>
        ))}
        <div className="sitemap-total">
          <span className="t-label">Unsold stock</span>
          <b>{cr(all.unsold)}</b>
        </div>
      </section>

      <div className="sitemap">
        <section className="panel sitemap-plan" aria-label="Site plan">
          <div className="sitemap-scroll">
          <svg viewBox="0 0 640 420" role="group" aria-label={`Site plan of ${project}`}>
            <rect x="0" y="0" width="640" height="420" fill="var(--map-ground)" />
            {/* internal road and boulevard */}
            <rect x="290" y="0" width="36" height="364" fill="var(--surface)" stroke="var(--map-edge)" />
            <rect x="0" y="364" width="640" height="56" fill="var(--surface)" stroke="var(--map-edge)" />
            <text x="20" y="397" className="sitemap-road">MAIN BOULEVARD · 120 FT</text>
            <path d="M296 364 h24" stroke="var(--brand-600)" strokeWidth="4" />
            <text x="308" y="356" textAnchor="middle" className="sitemap-note">Gate</text>
            {/* park */}
            <rect x="524" y="212" width="96" height="112" rx="6" fill="var(--map-park)" stroke="var(--map-park-border)" />
            <text x="572" y="272" textAnchor="middle" className="sitemap-note" fill="var(--map-park-fg)">
              Park
            </text>
            <text x="20" y="20" className="sitemap-note">N ↑</text>

            {towers.map((t) => {
              const p = PLACE[t.key];
              if (!p) return null;
              const { n, total } = tally(t.floors.flat());
              const left = n.A + n.H;
              const on = t.key === cur.key;
              let x = p.x + 12;
              const barW = p.w - 24;
              return (
                <g
                  key={t.key}
                  role="button"
                  tabIndex={0}
                  aria-pressed={on}
                  aria-label={`${t.label}: ${n.A} available, ${n.H} on hold, ${n.B} booked, ${n.S} sold`}
                  className={`sitemap-bldg ${on ? 'is-on' : ''}`}
                  onClick={() => onSelect(t.key)}
                  onKeyDown={keyPick(t.key)}
                >
                  <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="6" className="sitemap-bldg__box" />
                  <text x={p.x + 12} y={p.y + 26} className="sitemap-bldg__name">
                    {t.label}
                  </text>
                  <text x={p.x + 12} y={p.y + 46} className="sitemap-bldg__sub">
                    {left} of {total} left
                  </text>
                  <rect x={p.x + 12} y={p.y + p.h - 24} width={barW} height="10" fill="none" stroke="var(--border-strong)" />
                  {ORDER.map((k) => {
                    const w = (n[k] / total) * barW;
                    const r = <rect key={k} x={x} y={p.y + p.h - 24} width={w} height="10" fill={FILL[k]} />;
                    x += w;
                    return r;
                  })}
                </g>
              );
            })}
          </svg>
          </div>
          <p className="small muted sitemap-hint">Click a building to see every floor. Bars run sold → booked → on hold → available.</p>
        </section>

        <section className="panel sitemap-side" aria-label={`${cur.label} by floor`}>
          <div className="stack-1">
            <h2 className="panel__title">{cur.label}</h2>
            <span className="small muted">
              {cur.floors.length} floors · {curT.total} units · {curT.n.A + curT.n.H} left · {cr(curT.unsold)} unsold
            </span>
          </div>

          <div className="sitemap-elev" role="group" aria-label="Flats by floor, top floor first">
            {cur.floors.map((row) => (
              <div key={row[0].floor} className="sitemap-elev__row">
                <span className="sitemap-elev__floor">{floorName(row[0].floor)}</span>
                {row.map((u) => (
                  <button
                    key={u.code}
                    type="button"
                    className={`sitemap-elev__unit sitemap-sw--${u.status}`}
                    title={`${u.code} · ${u.type} · ${STATUS_LABEL[u.status]}${u.status === 'S' ? '' : ` · PKR ${fmtShort(u.price)}`}`}
                    aria-label={`${u.code}, ${u.type}, ${STATUS_LABEL[u.status]}`}
                    onClick={() => onOpenUnit(cur.key, u.code)}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="row-wrap small text-2" style={{ gap: 12 }}>
            {ORDER.map((k) => (
              <span key={k} className="row" style={{ gap: 6 }}>
                <i className={`sitemap-sw sitemap-sw--${k}`} aria-hidden="true" />
                {STATUS_LABEL[k]} {curT.n[k]}
              </span>
            ))}
          </div>
          <p className="small muted" style={{ margin: 0 }}>
            Click a flat to open it in the unit grid.
          </p>
        </section>
      </div>
    </div>
  );
}
