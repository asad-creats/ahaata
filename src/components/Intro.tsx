import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from './Icon';

/**
 * First-visit intro: a few short animated slides that say what Ehata is and
 * why it exists, then hand over to the guided tour or let the visitor explore.
 */

type Slide = { kicker: string; title: string; body: string; scene: ReactNode };

const SLIDE_MS = 6500;

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

function SceneWhat() {
  const sources: { icon: Parameters<typeof Icon>[0]['name']; label: string }[] = [
    { icon: 'whatsapp', label: 'WhatsApp' },
    { icon: 'phone', label: 'Calls' },
    { icon: 'share', label: 'Website' },
    { icon: 'users', label: 'Dealers' },
  ];
  return (
    <div className="intro-scene intro-what">
      {sources.map((s, i) => (
        <span key={s.label} className={`intro-chip intro-what__src intro-what__src--${i}`} style={{ animationDelay: `${0.2 + i * 0.35}s` }}>
          <Icon name={s.icon} size={14} />
          {s.label}
        </span>
      ))}
      <span className="intro-what__hub">
        <span className="logo-mark logo-mark--on-light">E</span>
        <span className="intro-what__pulse" />
      </span>
      <div className="intro-what__out">
        {['Leads', 'Units', 'Payments'].map((x, i) => (
          <span key={x} className="intro-chip intro-chip--brand" style={{ animationDelay: `${2.2 + i * 0.25}s` }}>
            <Icon name="check" size={12} />
            {x}
          </span>
        ))}
      </div>
    </div>
  );
}

function SceneProblem() {
  const leads = [
    { n: 'Bilal A.', s: 'WhatsApp · 2 days ago', lost: true },
    { n: 'Hira K.', s: 'Missed call · yesterday', lost: true },
    { n: 'Faisal R.', s: 'Portal · 4 hours ago', lost: false },
    { n: 'Nida S.', s: 'Dealer · last week', lost: true },
  ];
  return (
    <div className="intro-scene intro-problem">
      {leads.map((l, i) => (
        <div key={l.n} className={`intro-card ${l.lost ? 'is-lost' : ''}`} style={{ animationDelay: `${i * 0.25}s, ${1.8 + i * 0.4}s`, ['--d' as string]: `${1.8 + i * 0.4}s` }}>
          <span className="intro-avatar">{l.n[0]}</span>
          <span className="col min0">
            <b>{l.n}</b>
            <span className="small muted">{l.s}</span>
          </span>
          {l.lost && <span className="intro-tag">No follow-up</span>}
        </div>
      ))}
    </div>
  );
}

function SceneQueue() {
  const rows = ['Ali Raza · 2-bed, Tower B', 'Mehwish J. · site visit 4 pm', 'Kamran S. · waiting on reply'];
  return (
    <div className="intro-scene intro-queue">
      <span className="t-label">Next up</span>
      {rows.map((r, i) => (
        <div key={r} className={`intro-card ${i === 0 ? 'is-first' : ''}`} style={{ animationDelay: `${i * 0.2}s` }}>
          <span className="intro-avatar">{r[0]}</span>
          <span className="spacer ellipsis">{r}</span>
          {i === 0 ? (
            <span className="intro-status">
              <span className="intro-timer"><span /></span>
              <span className="intro-done"><Icon name="check" size={14} /> Logged</span>
            </span>
          ) : (
            <Icon name="phone" size={14} color="var(--text-muted)" />
          )}
        </div>
      ))}
    </div>
  );
}

function SceneUnits() {
  // Cells that change status, in the order they change.
  const order: [number, 'hold' | 'booked'][] = [[2, 'hold'], [5, 'booked'], [9, 'hold'], [6, 'booked']];
  return (
    <div className="intro-scene intro-units">
      <div className="intro-units__grid">
        {Array.from({ length: 12 }, (_, i) => {
          const at = order.findIndex(([c]) => c === i);
          return (
            <span
              key={i}
              className={`intro-unit ${at >= 0 ? `to-${order[at][1]}` : ''}`}
              style={at >= 0 ? { animationDelay: `${0.8 + at * 0.9}s` } : undefined}
            >
              {`${Math.floor(i / 4) + 3}0${(i % 4) + 1}`}
            </span>
          );
        })}
      </div>
      <div className="intro-units__legend small">
        <span><i className="sw sw--a" /> Available</span>
        <span><i className="sw sw--h" /> On hold</span>
        <span><i className="sw sw--b" /> Booked</span>
      </div>
    </div>
  );
}

function SceneLeaks() {
  const bars = [
    { l: 'New', v: 100 },
    { l: 'Contacted', v: 78 },
    { l: 'Site visit', v: 34, flag: true },
    { l: 'Booked', v: 22 },
  ];
  return (
    <div className="intro-scene intro-leaks">
      {bars.map((b, i) => (
        <div key={b.l} className="intro-bar">
          <span className="small muted intro-bar__l">{b.l}</span>
          <span className="intro-bar__track">
            <span className={`intro-bar__fill ${b.flag ? 'is-flag' : ''}`} style={{ width: `${b.v}%`, animationDelay: `${0.2 + i * 0.25}s` }} />
          </span>
          {b.flag && <span className="intro-tag intro-tag--warn">Biggest drop</span>}
        </div>
      ))}
    </div>
  );
}

function SceneStart() {
  return (
    <div className="intro-scene intro-start">
      <span className="logo-mark logo-mark--on-light intro-start__mark">E</span>
    </div>
  );
}

const SLIDES: Slide[] = [
  {
    kicker: 'What it is',
    title: 'One place to sell your project',
    body: 'Ehata is a CRM for real-estate developers. Every lead, unit and instalment, from first enquiry to final payment.',
    scene: <SceneWhat />,
  },
  {
    kicker: 'Why it exists',
    title: 'Good leads go quiet',
    body: 'Enquiries arrive on WhatsApp, calls, portals and through dealers. In phones and spreadsheets, follow-ups slip and buyers move on.',
    scene: <SceneProblem />,
  },
  {
    kicker: 'For agents',
    title: 'Every lead has a next step',
    body: 'The day starts with one queue, most urgent first. A call takes seconds to log and sets the next follow-up for you.',
    scene: <SceneQueue />,
  },
  {
    kicker: 'For the sales office',
    title: 'Inventory everyone can trust',
    body: 'Hold, book or release a unit and the whole team sees it at once, so the same flat is never promised twice.',
    scene: <SceneUnits />,
  },
  {
    kicker: 'For owners',
    title: 'See where deals slip',
    body: 'The funnel flags the biggest drop and why deals were lost. Every number opens the exact leads behind it.',
    scene: <SceneLeaks />,
  },
  {
    kicker: 'Try it',
    title: 'Explore with sample data',
    body: 'Everything here is a working demo. Nothing you change is saved, so click around freely.',
    scene: <SceneStart />,
  },
];

export function Intro({ onClose, onTour }: { onClose: () => void; onTour: () => void }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(reduced);
  const last = i === SLIDES.length - 1;
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panel.current?.focus();
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') setI((x) => Math.min(x + 1, SLIDES.length - 1));
      else if (e.key === 'ArrowLeft') setI((x) => Math.max(x - 1, 0));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const s = SLIDES[i];

  return (
    <div className="intro" role="dialog" aria-modal="true" aria-label="What Ehata is">
      <div className="intro__panel" ref={panel} tabIndex={-1}>
        <div className="intro__progress" aria-hidden="true">
          {SLIDES.map((_, k) => (
            <span key={k} className={k < i ? 'is-done' : ''}>
              {k === i && !last && (
                <span
                  key={i}
                  className="intro__fill"
                  style={{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: paused ? 'paused' : 'running' }}
                  onAnimationEnd={() => setI((x) => Math.min(x + 1, SLIDES.length - 1))}
                />
              )}
              {k === i && last && <span className="intro__fill is-full" />}
            </span>
          ))}
        </div>

        <button type="button" className="close-x intro__close" aria-label="Skip intro" onClick={onClose}>
          ×
        </button>

        <div className="intro__stage" key={i}>
          {s.scene}
        </div>

        <div className="intro__copy" key={`c${i}`} aria-live="polite">
          <span className="t-label">{s.kicker}</span>
          <h2 className="t-h1">{s.title}</h2>
          <p className="text-2">{s.body}</p>
        </div>

        {last ? (
          <div className="intro__actions">
            <button type="button" className="btn btn--primary btn--lg" onClick={onTour}>
              <Icon name="play" size={14} /> Watch the 1-minute tour
            </button>
            <button type="button" className="btn btn--secondary btn--lg" onClick={onClose}>
              Explore on my own
            </button>
          </div>
        ) : (
          <div className="intro__nav">
            <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
              Skip
            </button>
            <span className="spacer" />
            <button type="button" className="btn btn--ghost btn--sm" aria-pressed={paused} onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Play slides' : 'Pause slides'}>
              <Icon name={paused ? 'play' : 'pause'} size={14} />
            </button>
            <button type="button" className="btn btn--secondary btn--sm" disabled={i === 0} onClick={() => setI((x) => x - 1)}>
              Back
            </button>
            <button type="button" className="btn btn--primary btn--sm" onClick={() => setI((x) => x + 1)}>
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
