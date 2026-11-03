import { useMemo, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { STATUS_LABEL, type Status } from '../data/inventory';
import { BLOCK_A, BLOCK_C, LISTINGS, SHOPS, money, type Currency, type Plot } from '../data/site';
import { SiteHeader } from './PublicUnit';

const BRANDS = ['#0D3B2E', '#7A2E1F', '#1F3A6B', '#3A2A5C'];

function PlotCell({ p, size, hot, onPick, showNo }: { p: Plot; size: [number, number]; hot: boolean; onPick: (p: Plot) => void; showNo?: boolean }) {
  return (
    <button
      type="button"
      className={`st plot st--${p.k} ${hot ? 'st--sel plot--hot' : ''}`}
      style={{ width: size[0], height: size[1] }}
      aria-label={`Plot ${p.no}, ${STATUS_LABEL[p.k]}`}
      onClick={() => onPick(p)}
    >
      {p.k}
      {showNo && <span className="plot__no">{p.no.split('-')[1]}</span>}
    </button>
  );
}

export function PublicMap() {
  const [params] = useSearchParams();
  const brand = BRANDS.find((b) => b.slice(1).toLowerCase() === (params.get('brand') ?? '').toLowerCase()) ?? BRANDS[0];
  const [cur, setCur] = useState<Currency>('PKR');
  const [hover, setHover] = useState<string | null>(null);
  const [picked, setPicked] = useState<string>('C-114');
  const [zoom, setZoom] = useState(1);
  const [layer, setLayer] = useState<'plan' | 'sat'>('plan');
  const [availableOnly, setAvailableOnly] = useState(true);
  const [follow, setFollow] = useState(true);
  const [mobileList, setMobileList] = useState(false);

  const cards = useMemo(() => LISTINGS.filter((l) => !availableOnly || l.status !== 'S'), [availableOnly]);
  const hot = hover ?? picked;
  const pickedListing = LISTINGS.find((l) => l.plot === picked);
  const pickedPlot = [...BLOCK_A, ...BLOCK_C, ...SHOPS].find((p) => p.no === picked);

  const statusChip = (k: Status) => (
    <span className={`chip chip--sm chip--square ${k === 'A' ? 'chip--success' : 'chip--warning'}`}>{k === 'H' ? 'On hold' : STATUS_LABEL[k]}</span>
  );

  return (
    <div className="site" style={{ '--site-brand': brand } as CSSProperties}>
      <SiteHeader project="Saffron Gardens" approval="RDA approved · NOC RDA/LUB/2024/118" cur={cur} setCur={setCur} nav />

      <div className="site-filters">
        {(
          [
            ['Size', ['10 marla', '5 marla', '1 kanal']],
            ['Price', ['PKR 1 – 1.6 Cr', 'Under PKR 1 Cr', 'PKR 1.6 Cr +']],
            ['Block', ['All blocks', 'Block A', 'Block B', 'Block C']],
            ['Features', ['Corner, park-facing', 'Any']],
          ] as [string, string[]][]
        ).map(([l, opts]) => (
          <label key={l} className="site-filter">
            {l}
            <select className="select">
              {opts.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        ))}
        <label className="site-filter">
          Status
          <select className="select" value={availableOnly ? 'a' : 'all'} onChange={(e) => setAvailableOnly(e.target.value === 'a')}>
            <option value="a">Available only</option>
            <option value="all">All statuses</option>
          </select>
        </label>
        <span className="spacer" />
        <span>
          <b>38 plots</b> match · <a href="#reset">Reset</a>
        </span>
      </div>

      <div className="site-mobile-chips">
        {['10 marla', 'Under 1.5 Cr', 'Available', 'Filters · 2'].map((c, i) => (
          <button key={c} type="button" className={`m-pill ${i === 0 ? 'is-on' : ''}`} aria-pressed={i === 0}>
            {c}
          </button>
        ))}
      </div>

      <div className={`site-body ${mobileList ? 'is-list' : ''}`}>
        <section aria-label="Results" className="site-results">
          <span className="sheet__grip site-results__grip" />
          <div className="site-results__head">
            <span>
              <b className="site-results__count">38 plots</b>
              <span className="site-results__sort">Sorted by price, low to high</span>
            </span>
            <label className="check">
              <input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} /> Search as I move the map
            </label>
          </div>
          <div className="site-results__list">
            {cards.map((c) => (
              <Link
                key={c.code}
                to={`/site/unit/${c.plot}`}
                className={`site-card ${hot === c.plot ? 'is-hot' : ''}`}
                onMouseEnter={() => setHover(c.plot)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(c.plot)}
                onBlur={() => setHover(null)}
              >
                <span className="site-card__thumb">{c.code}</span>
                <span className="col spacer min0" style={{ gap: 4 }}>
                  <span className="row">
                    <b className="t-h3">{c.code}</b>
                    {statusChip(c.status)}
                  </span>
                  <span className="small text-2">{c.spec}</span>
                  <span className="row" style={{ alignItems: 'baseline' }}>
                    <b className="t-h3 nowrap">{money(c.price, cur)}</b>
                    <span className="small muted">{c.plan}</span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-label="Master plan map" className={`site-map ${layer === 'sat' ? 'is-sat' : ''}`}>
          <button type="button" className="site-map__listbtn" onClick={() => setMobileList((x) => !x)}>
            {mobileList ? 'Map view' : 'List view'}
          </button>
          <div className="site-map__canvas" style={{ transform: `scale(${zoom})` }}>
            <div className="site-map__road site-map__road--h">MAIN BOULEVARD · 120 FT</div>
            <div className="site-map__road site-map__road--v" />
            <div className="site-map__block" style={{ left: 40, top: 60 }}>
              <span className="site-map__label">BLOCK A · 5 marla</span>
              <div className="site-map__plots" style={{ gridTemplateColumns: 'repeat(10, 30px)' }}>
                {BLOCK_A.map((p) => (
                  <PlotCell key={p.no} p={p} size={[30, 30]} hot={hot === p.no} onPick={(x) => setPicked(x.no)} />
                ))}
              </div>
            </div>
            <div className="site-map__park" style={{ left: 460, top: 60, width: 220, height: 200 }}>
              Central park · 4 kanal
            </div>
            <div className="site-map__amenity" style={{ left: 700, top: 60 }}>
              Jamia masjid
            </div>
            <div className="site-map__block" style={{ left: 40, top: 400 }}>
              <span className="site-map__label">BLOCK C · 10 marla</span>
              <div className="site-map__plots" style={{ gridTemplateColumns: 'repeat(8, 40px)' }}>
                {BLOCK_C.map((p) => (
                  <PlotCell key={p.no} p={p} size={[40, 40]} hot={hot === p.no} onPick={(x) => setPicked(x.no)} showNo />
                ))}
              </div>
            </div>
            <div className="site-map__block" style={{ left: 460, top: 400 }}>
              <span className="site-map__label">COMMERCIAL · Shops</span>
              <div className="site-map__plots" style={{ gridTemplateColumns: 'repeat(6, 36px)' }}>
                {SHOPS.map((p) => (
                  <PlotCell key={p.no} p={p} size={[36, 28]} hot={hot === p.no} onPick={(x) => setPicked(x.no)} />
                ))}
              </div>
            </div>

            {pickedPlot && (
              <div role="dialog" aria-label={`Plot ${picked}`} className="panel panel--floating site-pop" style={popPos(picked)}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <b>Plot {picked}</b>
                  {statusChip(pickedPlot.k)}
                </div>
                {pickedPlot.k === 'S' ? (
                  <span className="small text-2">Sold. Similar plots nearby are listed on the left.</span>
                ) : (
                  <>
                    <span className="small text-2">{pickedListing?.spec ?? '10 marla · Block C'}</span>
                    {pickedPlot.k === 'H' ? <span className="small strong warning-text">On hold — check back soon</span> : <b className="t-h3">{money(pickedListing?.price ?? 12600000, cur)}</b>}
                    <span className="small muted">or 25% down + 16 quarterly of {money(((pickedListing?.price ?? 12600000) * 0.75) / 16, cur)}</span>
                  </>
                )}
                <div className="row" style={{ gap: 6 }}>
                  <Link to={`/site/unit/${picked}`} className="btn btn--site btn--fill">
                    View plot
                  </Link>
                  <a href="#visit" className="btn btn--secondary">
                    Book visit
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="site-map__tools">
            <div role="group" aria-label="Map layer" className="seg seg--dark seg--sm site-map__float">
              <button type="button" aria-pressed={layer === 'plan'} onClick={() => setLayer('plan')}>
                Master plan
              </button>
              <button type="button" aria-pressed={layer === 'sat'} onClick={() => setLayer('sat')}>
                Satellite
              </button>
            </div>
            <div className="col site-map__float" style={{ borderRadius: 6, overflow: 'hidden' }}>
              <button type="button" className="site-map__zoom" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(1.6, z + 0.2))}>
                +
              </button>
              <button type="button" className="site-map__zoom" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))} style={{ borderTop: '1px solid var(--border)' }}>
                −
              </button>
            </div>
          </div>

          <div className="site-map__legend site-map__float">
            {(['A', 'H', 'B', 'S'] as Status[]).map((k) => (
              <span key={k} className="row" style={{ gap: 6 }}>
                <span className={`st st--${k}`} style={{ width: 16, height: 16, fontSize: 9 }}>
                  {k}
                </span>
                {STATUS_LABEL[k]}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="site-brand-preview small muted" aria-label="Brand colour preview">
        Brand colour:
        {BRANDS.map((b) => (
          <Link key={b} to={`/site?brand=${b.slice(1)}`} className={`swatch swatch--link ${b === brand ? 'is-on' : ''}`} style={{ background: b }} aria-label={`Use brand colour ${b}`} />
        ))}
      </div>
      <CurrencyNote cur={cur} />
    </div>
  );
}

function popPos(no: string): CSSProperties {
  if (no.startsWith('C-')) {
    const i = parseInt(no.slice(2), 10) - 101;
    return { left: 40 + (i % 8) * 42 - 60, top: 400 + 24 + Math.floor(i / 8) * 42 + 52, width: 260 };
  }
  if (no.startsWith('A-')) {
    const i = parseInt(no.slice(2), 10) - 1;
    return { left: 40 + (i % 10) * 32 - 60, top: 60 + 24 + Math.floor(i / 10) * 32 + 40, width: 260 };
  }
  const i = parseInt(no.slice(2), 10) - 1;
  return { left: 460 + (i % 6) * 38 - 60, top: 400 + 24 + Math.floor(i / 6) * 30 + 36, width: 260 };
}

function CurrencyNote({ cur }: { cur: Currency }) {
  if (cur === 'PKR') return null;
  return (
    <div className="site-curnote small">
      <Icon name="info" size={12} /> Prices in {cur} are indicative; payments are made in PKR.
    </div>
  );
}

