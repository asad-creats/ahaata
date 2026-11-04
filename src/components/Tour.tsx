import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSession, type Role } from '../lib/session';
import { Icon } from './Icon';

/**
 * Guided feature tour: an animated cursor moves to each feature on the real
 * screens, clicks, types or drags, while a caption explains what is happening.
 */

type Step = {
  route: string;
  role?: Role;
  target: string;
  action?: 'click' | 'type' | 'drag' | 'hover';
  text?: string;
  dragTo?: string;
  dropName?: string;
  /** Clicked silently before the step starts, to set the scene. */
  prep?: string[];
  /** Keep the previous step's drawer or modal open. */
  keep?: boolean;
  /** Clicked only when the target isn't on screen (e.g. after jumping back). */
  setup?: string[];
  title: string;
  body: string;
};

const t = (name: string) => `[data-tour="${name}"]`;

const STEPS: Step[] = [
  { route: '/my-day', role: 'agent', target: t('search'), action: 'type', text: 'B-504', title: 'Find anything fast', body: 'Search by name, phone in any format, CNIC or unit code. Ctrl K jumps here from any screen.' },
  { route: '/my-day', role: 'agent', target: t('tile-overdue'), action: 'click', title: 'Your day, one queue at a time', body: 'These tiles switch between calls due, overdue follow-ups, site visits and replies you’re waiting on.' },
  { route: '/my-day', role: 'agent', target: t('call-first'), action: 'click', prep: [t('tile-call')], title: 'Calls sorted by SLA', body: 'The lead closest to breaching its response time is on top. Calling opens the call log straight away.' },
  { route: '/my-day', role: 'agent', target: t('outcome-Interested'), action: 'click', keep: true, setup: [t('tile-call'), t('call-first')], title: 'Log the call in seconds', body: 'Pick an outcome (required). The next follow-up is already filled in for tomorrow at 11:00.' },
  { route: '/pipeline', role: 'manager', target: t('card-Hamza Siddiqui'), action: 'drag', dragTo: t('dock-lost'), dropName: 'Hamza Siddiqui', title: 'Drag deals between stages', body: 'Move a card to any stage. Lost and Nurture stay docked on the right so they’re always in reach.' },
  { route: '/pipeline', role: 'manager', target: t('reason-Bought elsewhere'), action: 'click', keep: true, setup: ['drop:Hamza Siddiqui'], title: 'Every lost deal has a reason', body: 'A deal can’t be marked lost without a reason. Those reasons feed the Leak finder.' },
  { route: '/pipeline', role: 'manager', target: t('view-lost'), action: 'click', title: 'Lost isn’t gone', body: 'Open the Lost or Nurture list any time. Reopen a lead when the buyer comes back, with a note on why.' },
  { route: '/pipeline', role: 'manager', target: t('reopen-Rashid Iqbal'), action: 'hover', keep: true, setup: [t('view-lost')], title: 'Reopen in one click', body: 'Pick the stage it returns to. The SLA timer restarts and the note goes on the lead’s timeline.' },
  { route: '/leads', role: 'manager', target: t('assign'), action: 'click', title: 'Work on many leads at once', body: 'Tick rows (shift-click for a range), then assign, change stage, tag or export them together.' },
  { route: '/leads/L-20931', role: 'agent', target: t('tab-units'), action: 'click', title: 'One lead, three tabs', body: 'Activity, units of interest and stage history live in tabs, so the profile stays short.' },
  { route: '/inventory', role: 'manager', target: t('unit-B-705'), action: 'click', title: 'Live unit grid', body: 'Each unit shows a letter, colour and pattern for its status. Click one to hold, release or book it.' },
  { route: '/inventory', role: 'manager', target: t('tab-prices'), action: 'click', title: 'Price lists on their own tab', body: 'Change rates by floor band. Changes go out as a new price list version, recorded in the audit log.' },
  { route: '/dashboard', role: 'manager', target: t('kpi-Untouched > 24h'), action: 'hover', title: 'Every number opens its leads', body: 'Click a KPI or a bar to jump to the exact leads behind it, ready to assign.' },
  { route: '/dashboard', role: 'manager', target: t('funnel-drop'), action: 'hover', title: 'See where deals slip', body: 'The biggest stage-to-stage drop is flagged, with a link to the Leak finder.' },
  { route: '/dashboard', role: 'manager', target: t('user'), action: 'click', title: 'One app, five roles', body: 'Agent, Sales Manager, Owner/Admin, Dealer and Finance each get their own menu, landing page and limits.' },
  { route: '/site/unit/B-504', target: t('down-30'), action: 'click', title: 'Public site with a live calculator', body: 'Buyers choose down payment and plan length, and the instalments update instantly.' },
  { route: '/site/unit/B-504', target: t('years-4'), action: 'click', title: 'Ready to book a visit', body: 'Booking a visit or messaging on WhatsApp creates a lead with this unit attached. That’s the tour.' },
];

const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

async function waitFor(sel: string, ms = 4000): Promise<HTMLElement | null> {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el && el.getClientRects().length) return el;
    await sleep(80);
  }
  return null;
}

function setInputValue(el: HTMLInputElement, v: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(el, v);
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

/** Close open menus, drawers and modals between steps. */
function resetScene() {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
  const q = document.querySelector<HTMLInputElement>('input[aria-label="Global search"]');
  if (q && q.value) setInputValue(q, '');
  (document.activeElement as HTMLElement | null)?.blur?.();
}

type Ctx = { start: () => void; running: boolean };
const TourCtx = createContext<Ctx>({ start: () => {}, running: false });
export const useTour = () => useContext(TourCtx);

const SEEN = 'ehata.tourSeen.v1';

export function TourProvider({ children }: { children: ReactNode }) {
  const nav = useNavigate();
  const loc = useLocation();
  const session = useSession();
  const [index, setIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  const [cursor, setCursor] = useState({ x: -40, y: -40, down: false, ripple: 0 });
  const [ring, setRing] = useState<DOMRect | null>(null);
  const [offer, setOffer] = useState(() => {
    try {
      return !window.localStorage.getItem(SEEN);
    } catch {
      return true;
    }
  });
  const ghost = useRef<HTMLElement | null>(null);
  const tracked = useRef<HTMLElement | null>(null);
  const locRef = useRef(loc.pathname);
  locRef.current = loc.pathname;
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const stop = useCallback(() => {
    setIndex(null);
    setRing(null);
    tracked.current = null;
    ghost.current?.remove();
    ghost.current = null;
    resetScene();
  }, []);

  const start = useCallback(() => {
    setOffer(false);
    try {
      window.localStorage.setItem(SEEN, '1');
    } catch {
      /* ignore */
    }
    setPlaying(true);
    setIndex(0);
  }, []);

  // Keep the highlight ring on its target while the page scrolls or reflows.
  useEffect(() => {
    if (index === null) return;
    let raf = 0;
    const loop = () => {
      if (tracked.current?.isConnected) setRing(tracked.current.getBoundingClientRect());
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [index]);

  // Run the current step; changing step or pausing cancels the one in flight.
  useEffect(() => {
    if (index === null) return;
    const step = STEPS[index];
    let alive = true;
    const ok = () => alive;
    (async () => {
      ghost.current?.remove();
      ghost.current = null;
      if (!step.keep) resetScene();
      if (step.role && sessionRef.current.role !== step.role) sessionRef.current.setRole(step.role);
      if (locRef.current !== step.route) nav(step.route);
      await sleep(250);
      for (const p of step.prep ?? []) (await waitFor(p, 2000))?.click();
      if (step.setup && !(await waitFor(step.target, 400))) for (const p of step.setup) {
          if (p.startsWith('drop:')) window.dispatchEvent(new CustomEvent('tour:drop', { detail: { name: p.slice(5), to: 'lost' } }));
          else (await waitFor(p, 2000))?.click();
        }
      const el = await waitFor(step.target);
      if (!ok()) return;
      tracked.current = el;
      if (!el) return;
      el.scrollIntoView({ block: 'center', inline: 'center', behavior: reduced() ? 'auto' : 'smooth' });
      await sleep(reduced() ? 50 : 500);
      if (!ok()) return;
      const r = el.getBoundingClientRect();
      setCursor((c) => ({ ...c, x: r.left + r.width / 2, y: r.top + r.height / 2, down: false }));
      await sleep(reduced() ? 100 : 900);
      if (!ok()) return;

      if (step.action === 'click') {
        setCursor((c) => ({ ...c, down: true, ripple: c.ripple + 1 }));
        await sleep(160);
        el.click();
        setCursor((c) => ({ ...c, down: false }));
      } else if (step.action === 'type' && step.text) {
        const input = el.querySelector('input') ?? (el as HTMLInputElement);
        setCursor((c) => ({ ...c, down: true, ripple: c.ripple + 1 }));
        input.focus();
        await sleep(150);
        setCursor((c) => ({ ...c, down: false }));
        for (let i = 1; i <= step.text.length; i++) {
          if (!ok()) return;
          setInputValue(input as HTMLInputElement, step.text.slice(0, i));
          await sleep(160);
        }
      } else if (step.action === 'drag' && step.dragTo) {
        const dest = await waitFor(step.dragTo, 2000);
        if (!dest || !ok()) return;
        const from = el.getBoundingClientRect();
        const to = dest.getBoundingClientRect();
        const g = el.cloneNode(true) as HTMLElement;
        g.className += ' tour-ghost';
        Object.assign(g.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px` });
        document.body.appendChild(g);
        ghost.current = g;
        setCursor((c) => ({ ...c, down: true }));
        await sleep(200);
        const dx = to.left + to.width / 2 - (from.left + from.width / 2);
        const dy = to.top + 60 - (from.top + from.height / 2);
        g.style.transform = `translate(${dx}px, ${dy}px) rotate(-3deg)`;
        tracked.current = dest;
        setCursor((c) => ({ ...c, x: c.x + dx, y: c.y + dy }));
        await sleep(reduced() ? 100 : 1000);
        if (!ok()) return;
        setCursor((c) => ({ ...c, down: false, ripple: c.ripple + 1 }));
        g.remove();
        ghost.current = null;
        window.dispatchEvent(new CustomEvent('tour:drop', { detail: { name: step.dropName, to: 'lost' } }));
      }

      await sleep(3200);
      if (!ok() || !playing) return;
      setIndex((i) => (i === null ? null : i + 1 < STEPS.length ? i + 1 : null));
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, playing]);

  useEffect(() => {
    if (index === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => (i !== null && i + 1 < STEPS.length ? i + 1 : i));
      if (e.key === 'ArrowLeft') setIndex((i) => (i !== null && i > 0 ? i - 1 : i));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [index]);

  const step = index === null ? null : STEPS[index];

  return (
    <TourCtx.Provider value={{ start, running: index !== null }}>
      {children}

      {offer && index === null && (
        <div className="tour-offer" role="region" aria-label="Product tour">
          <Icon name="play" size={14} />
          <span className="spacer">Watch a 1-minute tour of the main features</span>
          <button type="button" className="btn btn--primary btn--sm" onClick={start}>
            Start tour
          </button>
          <button type="button" className="close-x" aria-label="Dismiss tour" onClick={() => setOffer(false)}>
            ×
          </button>
        </div>
      )}

      {step && (
        <>
          {ring && <div className="tour-ring" style={{ left: ring.left - 6, top: ring.top - 6, width: ring.width + 12, height: ring.height + 12 }} aria-hidden="true" />}
          <div className={`tour-cursor ${cursor.down ? 'is-down' : ''}`} style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }} aria-hidden="true">
            <span key={cursor.ripple} className="tour-cursor__ripple" />
            <svg width="22" height="24" viewBox="0 0 22 24">
              <path d="M2 2l17 9-7.5 2L8 21z" fill="#141A17" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="tour-card" role="dialog" aria-live="polite" aria-label="Feature tour">
            <div className="row">
              <span className="t-label spacer">
                Step {index! + 1} of {STEPS.length}
              </span>
              <button type="button" className="close-x" aria-label="End tour" onClick={stop}>
                ×
              </button>
            </div>
            <span className="track track--4">
              <span style={{ width: `${((index! + 1) / STEPS.length) * 100}%` }} />
            </span>
            <b className="t-h3">{step.title}</b>
            <p className="text-2" style={{ margin: 0 }}>
              {step.body}
            </p>
            <div className="row">
              <button type="button" className="btn btn--secondary btn--sm" disabled={index === 0} onClick={() => setIndex((i) => (i ? i - 1 : 0))}>
                Back
              </button>
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPlaying((p) => !p)} aria-pressed={!playing}>
                <Icon name={playing ? 'pause' : 'play'} size={14} />
                {playing ? 'Pause' : 'Play'}
              </button>
              <span className="spacer" />
              {index! + 1 < STEPS.length ? (
                <button type="button" className="btn btn--primary btn--sm" onClick={() => setIndex((i) => (i === null ? 0 : i + 1))}>
                  Next
                </button>
              ) : (
                <button type="button" className="btn btn--primary btn--sm" onClick={stop}>
                  Finish
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </TourCtx.Provider>
  );
}
