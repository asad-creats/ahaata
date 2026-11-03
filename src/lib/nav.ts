import type { IconName } from '../components/Icon';
import type { Role } from './session';

export type NavHeader = { kind: 'header'; label: string };
export type NavLink = {
  kind: 'link';
  key: string;
  label: string;
  icon: IconName;
  to: string;
  count?: string;
  /** Count drives action (overdue, unassigned): shown in danger colours. */
  alert?: boolean;
  /** Visible but read-only for this role. */
  locked?: boolean;
};
export type NavItem = NavHeader | NavLink;

const H = (label: string): NavHeader => ({ kind: 'header', label });
const L = (key: string, label: string, icon: IconName, to: string, count?: string, alert?: boolean, locked?: boolean): NavLink => ({
  kind: 'link',
  key,
  label,
  icon,
  to,
  count,
  alert,
  locked,
});

const teamWork = [
  H('Work'),
  L('myday', 'Team today', 'home', '/my-day', '19', true),
  L('pipeline', 'Pipeline', 'board', '/pipeline'),
  L('leads', 'Leads', 'list', '/leads', '1,284'),
  L('inventory', 'Inventory', 'grid', '/inventory'),
  L('bookings', 'Bookings', 'receipt', '/bookings?tab=all'),
];
const insights = [
  H('Insights'),
  L('dashboard', 'Dashboard', 'chart', '/dashboard'),
  L('leaks', 'Leak finder', 'funnel', '/leaks', '38', true),
  L('heatmap', 'Demand heatmap', 'heat', '/heatmap'),
  L('scorecards', 'Scorecards', 'score', '/scorecards'),
];

export const NAV: Record<Role, NavItem[]> = {
  agent: [
    H('Work'),
    L('myday', 'My day', 'home', '/my-day', '7', true),
    L('pipeline', 'Pipeline', 'board', '/pipeline'),
    L('leads', 'My leads', 'list', '/leads', '48'),
    L('inventory', 'Inventory', 'grid', '/inventory'),
    L('bookings', 'My bookings', 'receipt', '/bookings?tab=all', '2'),
  ],
  manager: [...teamWork, ...insights],
  admin: [...teamWork, ...insights, H('Admin'), L('settings', 'Settings', 'gear', '/settings')],
  dealer: [
    H('Al-Noor Estate'),
    L('referrals', 'My referrals', 'users', '/leads', '12'),
    L('inventory', 'Inventory', 'grid', '/inventory', undefined, false, true),
    L('commission', 'Commission', 'coin', '/bookings?tab=all'),
  ],
  finance: [
    H('Finance'),
    L('bookings', 'Bookings', 'receipt', '/bookings?tab=all'),
    L('instalments', 'Instalments due', 'cal', '/bookings', '23', true),
    L('receipts', 'Receipts', 'coin', '/bookings?tab=receipts'),
    L('inventory', 'Inventory', 'grid', '/inventory', undefined, false, true),
  ],
};

export const ROLE_LABEL: Record<Role, string> = {
  agent: 'Agent',
  manager: 'Sales Manager',
  admin: 'Owner/Admin',
  dealer: 'Dealer (external)',
  finance: 'Finance',
};

export const ROLE_SCOPE: Record<Role, string> = {
  agent: 'Sees own leads only',
  manager: 'Sees team: 9 agents, 4 dealers',
  admin: 'Sees all projects',
  dealer: 'Sees own referrals only',
  finance: 'Bookings & payments only',
};

export const LANDING: Record<Role, string> = {
  admin: '/dashboard',
  manager: '/my-day',
  agent: '/my-day',
  dealer: '/leads',
  finance: '/bookings',
};

/** Which roles may open a page. Scope is enforced on the server; this decides what the UI offers. */
export const ACCESS: Record<string, Role[]> = {
  '/my-day': ['agent', 'manager', 'admin'],
  '/pipeline': ['agent', 'manager', 'admin'],
  '/leads': ['agent', 'manager', 'admin', 'dealer'],
  '/lead': ['agent', 'manager', 'admin'],
  '/inventory': ['agent', 'manager', 'admin', 'dealer', 'finance'],
  '/bookings': ['agent', 'manager', 'admin', 'dealer', 'finance'],
  '/dashboard': ['manager', 'admin'],
  '/leaks': ['manager', 'admin'],
  '/heatmap': ['manager', 'admin'],
  '/scorecards': ['manager', 'admin'],
  '/settings': ['admin'],
};

/** Pick the active nav key: an exact path+query match wins, otherwise the first link on the same path. */
export function activeKey(items: NavItem[], pathname: string, search: string): string | undefined {
  const links = items.filter((i): i is NavLink => i.kind === 'link');
  const full = pathname + search;
  const exact = links.find((l) => l.to === full);
  if (exact) return exact.key;
  const base = '/' + pathname.split('/')[1];
  const prefix = links.find((l) => l.to.split('?')[0] === base && !l.to.includes('?'));
  return (prefix ?? links.find((l) => l.to.split('?')[0] === base))?.key;
}
