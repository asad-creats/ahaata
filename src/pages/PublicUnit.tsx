import { useState, type CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { money, unitFor, type Currency } from '../data/site';
import { useToast } from '../lib/toast';

const CURS: Currency[] = ['PKR', 'USD', 'AED', 'GBP'];

export function CurrencySwitch({ cur, setCur }: { cur: Currency; setCur: (c: Currency) => void }) {
  return (
    <div role="group" aria-label="Currency" className="seg seg--dark seg--sm site-cur">
      {CURS.map((c) => (
        <button key={c} type="button" aria-pressed={c === cur} onClick={() => setCur(c)}>
          {c}
        </button>
      ))}
    </div>
  );
}

/** Public site header — brandable per developer (logo, one brand colour, domain). */
export function SiteHeader({ project, approval, cur, setCur, nav }: { project: string; approval?: string; cur: Currency; setCur: (c: Currency) => void; nav?: boolean }) {
  return (
    <header className="site-header">
      <Link to="/site" className="row site-header__brand">
        <span className="site-logo">S</span>
        <span className="col" style={{ lineHeight: '16px' }}>
          <b>{project}</b>
          <span className="small muted">by Saffron Developers</span>
        </span>
      </Link>
      {nav && (
        <nav aria-label="Site" className="site-nav">
          <a href="#find" aria-current="page">
            Find a plot
          </a>
          <a href="#plans">Payment plans</a>
          <a href="#progress">Progress</a>
          <a href="#approvals">Approvals</a>
        </nav>
      )}
      <span className="spacer" />
      {approval && nav && (
        <span className="chip chip--success site-approval" style={{ height: 28, borderRadius: 14 }}>
          <Icon name="shield" size={12} stroke={2.5} />
          {approval}
        </span>
      )}
      <CurrencySwitch cur={cur} setCur={setCur} />
      <a href="#whatsapp" className="btn btn--wa btn--lg" aria-label="WhatsApp sales">
        <Icon name="chat" stroke={1.8} />
        <span className="site-wa-label">{nav ? 'WhatsApp sales' : 'WhatsApp'}</span>
      </a>
    </header>
  );
}

const ROOMS: [string, string, CSSProperties][] = [
  ['Living / dining', '22′ × 16′', { left: 0, top: 0, width: 230, height: 180, borderRight: '2px solid', borderBottom: '2px solid' }],
  ['Kitchen', '10′ × 9′', { left: 0, top: 180, width: 110, height: 114, borderRight: '2px solid' }],
  ['Bath 2', '7′ × 6′', { left: 110, top: 180, width: 120, height: 114, borderRight: '2px solid' }],
  ['Master bed + bath', '15′ × 13′', { left: 230, top: 0, width: 184, height: 150, borderBottom: '2px solid' }],
  ['Bedroom 2', '13′ × 12′', { left: 230, top: 150, width: 184, height: 144 }],
];

export function PublicUnit() {
  const { code = 'B-504' } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const u = unitFor(code);
  const [cur, setCur] = useState<Currency>('PKR');
  const [down, setDown] = useState(25);
  const [years, setYears] = useState(u.kind === 'plot' ? 4 : 3);
  const [freq, setFreq] = useState<'Quarterly' | 'Monthly'>('Quarterly');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [tried, setTried] = useState(false);

  const dp = (u.price * down) / 100;
  const poss = u.price * u.possessionShare;
  const count = years * (freq === 'Quarterly' ? 4 : 12);
  const inst = (u.price - dp - poss) / count;
  const phoneOk = /^(\+?92|0)?3\d{9}$/.test(phone.replace(/[\s-]/g, ''));

  const book = () => {
    setTried(true);
    if (!name.trim() || !phoneOk) return;
    toast({ text: `Thanks ${name.split(' ')[0]} — a sales advisor will WhatsApp you within 15 minutes.` });
    setName('');
    setPhone('');
    setTried(false);
  };

  const toggle = (on: boolean) => ({ 'aria-pressed': on, className: 'toggle' });

  return (
    <div className="site site--unit">
      <SiteHeader project={u.project} cur={cur} setCur={setCur} />
      <div className="site-unit-topbar">
        <button type="button" className="btn btn--ghost btn--icon" aria-label="Back to map" style={{ color: 'var(--text)' }} onClick={() => nav('/site')}>
          <Icon name="chevronLeft" size={20} />
        </button>
        <b className="spacer">{u.kind === 'plot' ? `Plot ${u.code}` : u.code}</b>
        <button type="button" className="btn btn--ghost btn--icon" aria-label="Share" style={{ color: 'var(--text)' }} onClick={() => navigator.share?.({ title: u.title, url: window.location.href })}>
          <Icon name="share" size={18} />
        </button>
      </div>

      <div className="site-unit">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <Link to="/site">{u.crumb[0]}</Link>
          {u.crumb.slice(1).map((c) => (
            <span key={c}>/ {c}</span>
          ))}
        </nav>
        <div className="split" style={{ gap: 32 }}>
          <div className="stack-6 min0" style={{ flex: '999 1 600px' }}>
            <div className="stack-2">
              <div className="row-wrap">
                <span className="chip chip--success">Available</span>
                <span className="chip chip--neutral">
                  <Icon name="shield" size={12} stroke={2.5} color="var(--success)" />
                  {u.approval}
                </span>
                {u.possession && <span className="chip chip--neutral">{u.possession}</span>}
              </div>
              <h1 className="t-display">{u.title}</h1>
              <span className="text-2">{u.sub}</span>
              <div className="site-unit__mobile-price">
                <div className="t-h1 bold">{money(u.price, cur)}</div>
                <div className="small muted">
                  ≈ {money(u.price, 'USD')} · {money(u.price, 'AED')} · {money(u.price, 'GBP')}
                </div>
              </div>
            </div>

            <div className="site-gallery">
              <div className="photo-ph" style={{ gridRow: '1 / 3' }}>
                {u.kind === 'plot' ? `[Site plan crop: ${u.code} highlighted]` : '[Photo: living room, sample apartment B-404]'}
              </div>
              <div className="photo-ph">{u.kind === 'plot' ? '[Photo: park lane, Block C]' : '[Photo: master bedroom]'}</div>
              <div className="photo-ph" style={{ position: 'relative' }}>
                {u.kind === 'plot' ? '[Photo: development progress, Oct 2026]' : '[Photo: view from balcony]'}
                <button type="button" className="btn btn--secondary btn--xs" style={{ position: 'absolute', right: 8, bottom: 8, height: 32, border: 0, boxShadow: '0 1px 2px rgba(13,26,20,.16)' }}>
                  All 14 photos
                </button>
              </div>
            </div>

            <section aria-labelledby="h-fp" className="stack-3">
              <div className="row" style={{ alignItems: 'baseline', gap: 12 }}>
                <h2 id="h-fp" className="t-h2 spacer">
                  {u.kind === 'plot' ? 'Plot details' : 'Floor plan'}
                </h2>
                <a href="#pdf" className="strong">
                  Download PDF
                </a>
              </div>
              <div className="row-wrap" style={{ gap: 24, alignItems: 'flex-start' }}>
                {u.kind === 'apartment' && (
                  <div role="img" aria-label="Floor plan of B-504: living and dining, kitchen, two bedrooms with attached baths, balcony" className="floorplan">
                    {ROOMS.map(([n, d, st]) => (
                      <div key={n} className="floorplan__room" style={st}>
                        <b>{n}</b>
                        <span className="muted">{d}</span>
                      </div>
                    ))}
                    <div className="floorplan__balcony">Balcony 18′ × 5′ · East</div>
                  </div>
                )}
                <dl className="site-facts">
                  {u.facts.map(([k, v]) => (
                    <div key={k} style={{ display: 'contents' }}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>

            <section aria-labelledby="h-plan" className="stack-3">
              <h2 id="h-plan" className="t-h2">
                Instalment calculator
              </h2>
              <div className="calc-controls panel">
                <div className="stack-2" style={{ gap: 6 }}>
                  <span className="field__label">Down payment</span>
                  <div role="group" aria-label="Down payment" className="row" style={{ gap: 6 }}>
                    {[20, 25, 30].map((d) => (
                      <button key={d} type="button" data-tour={`down-${d}`} {...toggle(d === down)} onClick={() => setDown(d)}>
                        {d}%
                      </button>
                    ))}
                  </div>
                </div>
                <div className="stack-2" style={{ gap: 6 }}>
                  <span className="field__label">Plan length</span>
                  <div role="group" aria-label="Plan length" className="row" style={{ gap: 6 }}>
                    {[2, 3, 4].map((y) => (
                      <button key={y} type="button" data-tour={`years-${y}`} {...toggle(y === years)} onClick={() => setYears(y)}>
                        {y} years
                      </button>
                    ))}
                  </div>
                </div>
                <div className="stack-2" style={{ gap: 6 }}>
                  <span className="field__label">Frequency</span>
                  <div role="group" aria-label="Frequency" className="row" style={{ gap: 6 }}>
                    {(['Quarterly', 'Monthly'] as const).map((f) => (
                      <button key={f} type="button" {...toggle(f === freq)} onClick={() => setFreq(f)}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="calc-out panel panel--clip" aria-live="polite">
                <div className="kv">
                  <span>Down payment</span>
                  <b className="t-h2">{money(dp, cur)}</b>
                </div>
                <div className="kv is-key">
                  <span>
                    {count} {freq.toLowerCase()} instalments of
                  </span>
                  <b className="t-h2">{money(inst, cur)}</b>
                </div>
                {u.possessionShare > 0 && (
                  <div className="kv">
                    <span>On possession ({u.possessionShare * 100}%)</span>
                    <b className="t-h2">{money(poss, cur)}</b>
                  </div>
                )}
                <div className="kv">
                  <span>Total</span>
                  <b className="t-h2">{money(u.price, cur)}</b>
                </div>
              </div>
              <span className="small muted">
                {cur === 'PKR' ? 'Payable in PKR.' : `Shown in ${cur} for reference; payments are made in PKR through Roshan Digital Account or bank transfer.`} No interest; price is fixed once booked. Final plan is confirmed in your allotment letter.
              </span>
            </section>
          </div>

          <aside className="site-aside">
            <div id="visit" className="panel stack-4" style={{ padding: 20, boxShadow: '0 8px 24px rgba(13,26,20,.08)' }}>
              <div className="kv">
                <span>Price</span>
                <b className="t-display">{money(u.price, cur)}</b>
                <span className="small muted">
                  {cur === 'PKR' ? u.rate : `Indicative rate 1 ${cur} = PKR ${RATE_LABEL[cur]}, updated daily`} · price list effective 1 Oct 2026
                </span>
              </div>
              <form
                className="stack-3"
                style={{ gap: 10 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  book();
                }}
              >
                <b className="t-h3">Book a site visit</b>
                <label className="field">
                  <span className="field__label">Your name</span>
                  <input className="input input--lg" placeholder="e.g. Ayesha Khan" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={tried && !name.trim()} autoComplete="name" />
                </label>
                <label className="field">
                  <span className="field__label">Mobile (WhatsApp)</span>
                  <input className="input input--lg" placeholder="+92 3XX XXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} aria-invalid={tried && !phoneOk} inputMode="tel" autoComplete="tel" />
                  {tried && !phoneOk && <span className="field__error">Enter a Pakistani mobile number, e.g. 0300 1234567</span>}
                </label>
                <label className="field">
                  <span className="field__label">Preferred day</span>
                  <select className="select select--lg">
                    <option>Sat 7 Nov, morning</option>
                    <option>Sun 8 Nov, afternoon</option>
                    <option>Video tour (overseas)</option>
                  </select>
                </label>
                <button type="submit" className="btn btn--site btn--xl">
                  Book a visit
                </button>
                <a href="#whatsapp" className="btn btn--wa-outline btn--xl" style={{ fontSize: 14 }}>
                  <Icon name="chat" stroke={1.8} />
                  Ask about {u.code} on WhatsApp
                </a>
                <span className="small muted">A sales advisor replies within 15 minutes, 10:00–20:00 PKT. Overseas buyers: video tour available.</span>
              </form>
            </div>
            <div className="panel stack-2 small" style={{ padding: 16, gap: 6 }}>
              <b style={{ fontSize: 14 }}>Similar available {u.kind === 'plot' ? 'plots' : 'units'}</b>
              {u.similar.map(([l, p]) => (
                <a key={l} href="#similar" className="row" style={{ justifyContent: 'space-between', color: 'var(--text)', textDecoration: 'none' }}>
                  <span>{l}</span>
                  <b>{money(p, cur)}</b>
                </a>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <div className="site-cta-bar">
        <a href="#whatsapp" className="btn btn--wa-outline" style={{ height: 48 }}>
          <Icon name="chat" stroke={1.8} />
          WhatsApp
        </a>
        <a href="#visit" className="btn btn--site btn--fill" style={{ height: 48, fontSize: 16 }}>
          Book a visit
        </a>
      </div>
    </div>
  );
}

const RATE_LABEL: Record<Currency, string> = { PKR: '1', USD: '280', AED: '76.3', GBP: '355' };
