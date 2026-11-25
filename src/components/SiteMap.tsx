import { useMemo, useState } from 'react';
import { GARDEN_AREAS, GARDEN_LABELS, GARDEN_PLOTS, GATE, RESIDENCIA_AREAS, RESIDENCIA_BUILDINGS, RESIDENCIA_LABELS, type Plot } from '../data/gardens';
import { STATUS_LABEL, floorName, fmtShort, type Status, type Unit } from '../data/inventory';
import { useToast } from '../lib/toast';
import { ProjectMap, type MapShape } from './ProjectMap';

/**
 * Inventory › Site map: the project on a satellite map, every plot or
 * building coloured by availability and clickable, for showing stock to a
 * developer or agency.
 */

export type MapTower = { key: string; label: string; floors: Unit[][] };

const ORDER: Status[] = ['A', 'H', 'B', 'S'];
const PROJECTS = [
  { name: 'Saffron Gardens', note: 'Plots' },
  { name: 'Saffron Residencia', note: 'Towers' },
];

// The claude.ai demo can't load map imagery from other sites.
const CAN_SATELLITE = !import.meta.env.VITE_DEMO;

function count<T>(items: T[], status: (t: T) => Status) {
  const n: Record<Status, number> = { A: 0, H: 0, B: 0, S: 0 };
  for (const i of items) n[status(i)]++;
  return n;
}

/** Middle of a building's north edge, nudged inside, for its label. */
const topMid = (p: [number, number][]): [number, number] => [(p[2][0] + p[3][0]) / 2 - 0.00006, (p[2][1] + p[3][1]) / 2];

const cr = (p: number) => `PKR ${(p / 10000000).toLocaleString('en-US', { maximumFractionDigits: 0 })} Cr`;
const money = (p: number) => (p >= 10000000 ? `PKR ${(p / 10000000).toFixed(2)} Cr` : `PKR ${(p / 100000).toFixed(0)} lakh`);

export function SiteMap({
  project,
  setProject,
  towers,
  readOnly,
  me,
  theme,
  onOpenUnit,
}: {
  project: string;
  setProject: (p: string) => void;
  towers: MapTower[];
  readOnly: boolean;
  me: string;
  theme: string;
  onOpenUnit: (tower: string, code: string) => void;
}) {
  const toast = useToast();
  const gardens = project === 'Saffron Gardens';
  const [satellite, setSatellite] = useState(CAN_SATELLITE);
  const [hidden, setHidden] = useState<Record<Status, boolean>>({ A: false, H: false, B: false, S: false });
  const [sel, setSel] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, Partial<Plot>>>({});

  const plots = useMemo(() => GARDEN_PLOTS.map((p) => ({ ...p, ...edits[p.no] })), [edits]);

  const towerStats = useMemo(
    () =>
      towers.map((t) => {
        const units = t.floors.flat();
        const n = count(units, (u) => u.status);
        const left = n.A + n.H;
        // A building takes the colour of where it stands overall.
        const status: Status = left === 0 || n.S > units.length / 2 ? 'S' : n.B + n.S > units.length * 0.6 ? 'B' : n.H > n.A ? 'H' : 'A';
        return { t, n, units, left, status };
      }),
    [towers],
  );

  const shapes: MapShape[] = useMemo(
    () =>
      gardens
        ? plots.map((p) => ({ id: p.no, poly: p.poly, status: p.status, tip: `${p.no} · ${p.marla} marla · ${STATUS_LABEL[p.status]}${p.status === 'A' || p.status === 'H' ? ` · ${money(p.price)}` : ''}` }))
        : towerStats.map(({ t, left, units, status }) => ({ id: t.key, poly: RESIDENCIA_BUILDINGS[t.key], status, tip: `${t.label} · ${left} of ${units.length} left` })),
    [gardens, plots, towerStats],
  );

  const towerLabels = useMemo(() => [...RESIDENCIA_LABELS, ...towerStats.map(({ t, left }) => ({ text: `${t.label} · ${left} left`, at: topMid(RESIDENCIA_BUILDINGS[t.key]) }))], [towerStats]);

  const allUnits = towers.flatMap((t) => t.floors.flat());
  const n = gardens ? count(plots, (p) => p.status) : count(allUnits, (u) => u.status);
  const total = n.A + n.H + n.B + n.S;
  const unsold = (gardens ? plots : allUnits).filter((p) => p.status === 'A' || p.status === 'H').reduce((s, p) => s + p.price, 0);

  const plot = gardens ? plots.find((p) => p.no === sel) : undefined;
  const tower = gardens ? undefined : (towerStats.find((x) => x.t.key === sel) ?? towerStats[1]);

  const edit = (no: string, p: Partial<Plot>) => setEdits((e) => ({ ...e, [no]: { ...e[no], ...p } }));

  const blocks = gardens
    ? ['Block A', 'Block B', 'Block C', 'Commercial'].map((b) => {
        const ps = plots.filter((p) => p.block === b);
        return { b, left: ps.filter((p) => p.status === 'A').length, total: ps.length, from: Math.min(...ps.map((p) => p.price)) };
      })
    : [];

  return (
    <div className="stack-4">
      <div role="tablist" aria-label="Project" className="seg" style={{ alignSelf: 'flex-start' }}>
        {PROJECTS.map((p) => (
          <button
            key={p.name}
            type="button"
            role="tab"
            aria-selected={project === p.name}
            onClick={() => {
              setSel(null);
              setProject(p.name);
            }}
          >
            {p.name}&nbsp;<span className="muted">· {p.note}</span>
          </button>
        ))}
      </div>

      <section className="panel sitemap-totals" aria-label="Whole project">
        <div className="sitemap-total">
          <span className="t-label">{gardens ? 'Plots' : 'Units'}</span>
          <b>{total}</b>
        </div>
        {ORDER.map((k) => (
          <div key={k} className="sitemap-total">
            <span className="t-label">
              <i className={`sitemap-sw sitemap-sw--${k}`} aria-hidden="true" /> {STATUS_LABEL[k]}
            </span>
            <b>{n[k]}</b>
          </div>
        ))}
        <div className="sitemap-total">
          <span className="t-label">Unsold stock</span>
          <b>{cr(unsold)}</b>
        </div>
      </section>

      <div className="sitemap">
        <section className="panel panel--clip sitemap-plan" aria-label={`Map of ${project}`}>
          <ProjectMap
            shapes={shapes}
            areas={gardens ? GARDEN_AREAS : RESIDENCIA_AREAS}
            labels={gardens ? GARDEN_LABELS : towerLabels}
            gate={gardens ? GATE : undefined}
            selected={gardens ? sel : (tower?.t.key ?? null)}
            hidden={hidden}
            satellite={satellite}
            theme={theme}
            onSelect={setSel}
          >
            <div className="pmap__mode seg" role="tablist" aria-label="Map style">
              <button type="button" role="tab" aria-selected={!satellite} onClick={() => setSatellite(false)}>
                Plan
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={satellite}
                disabled={!CAN_SATELLITE}
                title={CAN_SATELLITE ? undefined : 'Satellite imagery is off in this preview'}
                onClick={() => setSatellite(true)}
              >
                Satellite
              </button>
            </div>
            <div className="pmap__key" role="group" aria-label="Map key: click to show or hide">
              <span className="t-label">Map key</span>
              {ORDER.map((k) => (
                <button key={k} type="button" aria-pressed={!hidden[k]} className={hidden[k] ? 'is-off' : ''} onClick={() => setHidden((h) => ({ ...h, [k]: !h[k] }))}>
                  <i className={`sitemap-sw sitemap-sw--${k}`} aria-hidden="true" />
                  {STATUS_LABEL[k]} <b>{n[k]}</b>
                </button>
              ))}
            </div>
          </ProjectMap>
        </section>

        <section className="panel sitemap-side" aria-live="polite">
          {gardens && plot && (
            <>
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <div className="spacer stack-1">
                  <h2 className="t-h2">Plot {plot.no}</h2>
                  <span className="small muted">
                    {plot.block} · {plot.marla} marla · {plot.size}
                  </span>
                </div>
                <button type="button" className="close-x" aria-label="Close plot details" onClick={() => setSel(null)}>
                  ×
                </button>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <i className={`sitemap-sw sitemap-sw--${plot.status}`} aria-hidden="true" />
                <b>{STATUS_LABEL[plot.status]}</b>
                {plot.status === 'H' && (
                  <span className="small text-2">
                    for {plot.holdFor}, ends in {plot.holdLeft}
                  </span>
                )}
              </div>
              <div className="unit-facts">
                <div className="kv">
                  <span>Price</span>
                  <b className="t-h3">{plot.status === 'S' ? 'Sold' : money(plot.price)}</b>
                </div>
                <div className="kv">
                  <span>Per marla</span>
                  <b className="t-h3">{fmtShort(plot.price / plot.marla)}</b>
                </div>
                <div className="kv">
                  <span>Position</span>
                  <span>{plot.corner ? 'Corner' : 'Middle of row'}</span>
                </div>
                <div className="kv">
                  <span>Facing</span>
                  <span>{plot.facing}</span>
                </div>
                <div className="kv">
                  <span>Payment plan</span>
                  <span>25% down + 16 quarterly</span>
                </div>
                <div className="kv">
                  <span>Possession</span>
                  <span>{plot.block === 'Block C' ? 'Ready now' : 'June 2027'}</span>
                </div>
              </div>
              {(plot.status === 'A' || plot.status === 'H') && !readOnly && (
                <div className="row" style={{ gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn--secondary btn--fill"
                    onClick={() => {
                      edit(plot.no, { status: 'H', holdFor: plot.holdFor ?? 'Faraz Ahmed', holdLeft: '47h 59m' });
                      toast({ text: `Plot ${plot.no} held for 48h` });
                    }}
                  >
                    {plot.status === 'H' ? 'Extend hold 48h' : 'Hold 48h'}
                  </button>
                  <button
                    type="button"
                    className="btn btn--primary btn--fill"
                    onClick={() => {
                      edit(plot.no, { status: 'B', holdLeft: undefined });
                      toast({ text: `Plot ${plot.no} booked by ${me} · Finance will confirm the token` });
                    }}
                  >
                    Book plot
                  </button>
                </div>
              )}
              {plot.status === 'H' && !readOnly && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  style={{ alignSelf: 'flex-start' }}
                  onClick={() => {
                    edit(plot.no, { status: 'A', holdFor: undefined, holdLeft: undefined });
                    toast({ text: `Hold on ${plot.no} released` });
                  }}
                >
                  Release hold
                </button>
              )}
            </>
          )}

          {gardens && !plot && (
            <>
              <div className="stack-1">
                <h2 className="panel__title">Saffron Gardens</h2>
                <span className="small muted">RDA approved · {total} plots. Click any plot for its price and status.</span>
              </div>
              <ul className="plain-list sitemap-blocks">
                {blocks.map((b) => (
                  <li key={b.b}>
                    <span className="spacer">
                      <b>{b.b}</b>
                      <span className="small muted"> · from {money(b.from)}</span>
                    </span>
                    <span className="small">
                      <b>{b.left}</b> <span className="muted">of {b.total} available</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {tower && (
            <>
              <div className="stack-1">
                <h2 className="panel__title">{tower.t.label}</h2>
                <span className="small muted">
                  {tower.t.floors.length} floors · {tower.units.length} units · {tower.left} left. Click another building on the map to switch.
                </span>
              </div>
              <div className="sitemap-elev" role="group" aria-label="Units by floor, top floor first">
                {tower.t.floors.map((row) => (
                  <div key={row[0].floor} className="sitemap-elev__row">
                    <span className="sitemap-elev__floor">{floorName(row[0].floor)}</span>
                    {row.map((u) => (
                      <button
                        key={u.code}
                        type="button"
                        className={`sitemap-elev__unit sitemap-sw--${u.status}`}
                        title={`${u.code} · ${u.type} · ${STATUS_LABEL[u.status]}${u.status === 'S' ? '' : ` · PKR ${fmtShort(u.price)}`}`}
                        aria-label={`${u.code}, ${u.type}, ${STATUS_LABEL[u.status]}`}
                        onClick={() => onOpenUnit(tower.t.key, u.code)}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="row-wrap small text-2" style={{ gap: 12 }}>
                {ORDER.map((k) => (
                  <span key={k} className="row" style={{ gap: 6 }}>
                    <i className={`sitemap-sw sitemap-sw--${k}`} aria-hidden="true" />
                    {STATUS_LABEL[k]} {tower.n[k]}
                  </span>
                ))}
              </div>
              <p className="small muted" style={{ margin: 0 }}>
                Click a unit to open it in the unit grid.
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
