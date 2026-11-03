import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePopover } from '../lib/hooks';
import { ACCESS, LANDING, NAV, activeKey, type NavLink } from '../lib/nav';
import { useSession } from '../lib/session';
import { AppSideNav } from './AppSideNav';
import { AppTopBar } from './AppTopBar';
import { Icon } from './Icon';

/**
 * Internal app frame: identical top bar on every screen, role-aware side nav,
 * collapsing to an icon rail at 1024–1279 and a bottom tab bar below 1024.
 */
export function AppShell({ children, page, roomy }: { children: ReactNode; page: string; roomy?: boolean }) {
  const s = useSession();
  const allowed = ACCESS[page]?.includes(s.role) ?? true;
  return (
    <div className="shell">
      <AppTopBar />
      <div className="shell__body">
        <AppSideNav role={s.role} />
        <main className={`shell__main ${roomy ? 'shell__main--roomy' : ''}`} id="main">
          {allowed ? children : <Restricted page={page} />}
        </main>
      </div>
      <BottomTabs />
    </div>
  );
}

function BottomTabs() {
  const s = useSession();
  const loc = useLocation();
  const more = usePopover();
  const links = NAV[s.role].filter((i): i is NavLink => i.kind === 'link');
  const current = activeKey(NAV[s.role], loc.pathname, loc.search);
  const primary = links.slice(0, 4);
  const rest = links.slice(4);
  return (
    <nav className="bottom-tabs" aria-label="Main">
      {primary.map((l) => (
        <Link key={l.key} to={l.to} className="bottom-tabs__item" aria-current={l.key === current ? 'page' : undefined}>
          <Icon name={l.icon} size={20} stroke={1.8} />
          <span className="ellipsis" style={{ maxWidth: '100%' }}>
            {l.label}
          </span>
        </Link>
      ))}
      <div ref={more.ref} style={{ display: 'contents' }}>
        <button type="button" className="bottom-tabs__item" aria-expanded={more.open} onClick={more.toggle}>
          <Icon name="more" size={20} stroke={2.5} />
          More
        </button>
        {more.open && (
          <div className="menu bottom-tabs__more" role="menu">
            {rest.map((l) => (
              <Link key={l.key} to={l.to} role="menuitem" className="menu__item" onClick={() => more.setOpen(false)}>
                <Icon name={l.icon} size={18} stroke={1.8} />
                {l.label}
              </Link>
            ))}
            <Link to="/m" role="menuitem" className="menu__item" onClick={() => more.setOpen(false)}>
              <Icon name="phone" size={18} stroke={1.8} />
              Mobile agent app
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

const PAGE_NAME: Record<string, string> = {
  '/my-day': 'My day',
  '/pipeline': 'Pipeline',
  '/leads': 'Leads',
  '/lead': 'This lead',
  '/dashboard': 'Dashboard',
  '/leaks': 'Leak finder',
  '/heatmap': 'Demand heatmap',
  '/scorecards': 'Scorecards',
  '/settings': 'Settings',
};

/** Restricted pages show the restriction and the path to access, never a blank screen. */
export function Restricted({ page }: { page: string }) {
  const s = useSession();
  const name = PAGE_NAME[page] ?? 'This page';
  const dealer = s.role === 'dealer';
  const body = dealer
    ? 'Dealer accounts can see their own referrals, unit availability and commission. Team-wide numbers aren’t shared with external partners.'
    : page === '/settings'
      ? 'Settings change how the whole organisation works, so only Owner/Admin can open them. Ask Sana Malik if something needs changing.'
      : s.role === 'finance'
        ? 'Finance accounts see bookings, schedules and receipts. Pipeline and lead activity stay with the sales team.'
        : 'Your role doesn’t include this page. A Sales Manager or Owner/Admin can share what you need.';
  return (
    <div className="panel" style={{ padding: 32, maxWidth: 640 }}>
      <div className="stack-3" style={{ alignItems: 'flex-start' }}>
        <span style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="lock" size={20} stroke={1.8} color="var(--text-2)" />
        </span>
        <h1 className="t-h2">
          {name} is for {s.org.name} {dealer ? 'staff' : page === '/settings' ? 'admins' : 'sales staff'}
        </h1>
        <p className="text-2" style={{ margin: 0 }}>
          {body}
        </p>
        <div className="row-wrap">
          <Link to={LANDING[s.role]} className="btn btn--primary">
            {dealer ? 'Go to My referrals' : 'Go to my home'}
          </Link>
          {dealer && (
            <Link to="/bookings?tab=all" className="btn btn--secondary">
              View my commission
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
