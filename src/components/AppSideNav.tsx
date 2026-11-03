import { Link, useLocation } from 'react-router-dom';
import { NAV, ROLE_LABEL, ROLE_SCOPE, activeKey } from '../lib/nav';
import type { Role } from '../lib/session';
import { Icon } from './Icon';

/** Role-aware side navigation. Items come from Role; counts only where they drive action. */
export function AppSideNav({ role, active, embedded }: { role: Role; active?: string; embedded?: boolean }) {
  const loc = useLocation();
  const items = NAV[role];
  const current = active ?? activeKey(items, loc.pathname, loc.search);
  return (
    <nav aria-label="Main" className={`sidenav ${embedded ? 'sidenav--embedded' : ''}`}>
      {items.map((it) =>
        it.kind === 'header' ? (
          <div key={'h-' + it.label} className="sidenav__header">
            {it.label}
          </div>
        ) : (
          <Link key={it.key} to={it.to} className="sidenav__link" aria-current={it.key === current ? 'page' : undefined} data-label={it.label}>
            <Icon name={it.icon} size={18} stroke={1.8} />
            <span className="sidenav__label">{it.label}</span>
            {it.count && <span className={`count ${it.alert ? 'count--alert' : ''}`}>{it.count}</span>}
            {it.locked && <span className="sidenav__lock">View only</span>}
          </Link>
        ),
      )}
      <div className="sidenav__foot">
        <span>
          Signed in as <b>{ROLE_LABEL[role]}</b>
        </span>
        <span>{ROLE_SCOPE[role]}</span>
      </div>
    </nav>
  );
}
