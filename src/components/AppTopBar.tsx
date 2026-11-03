import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { search, type SearchHit } from '../data/search';
import { usePopover } from '../lib/hooks';
import { LANDING } from '../lib/nav';
import { ORGS, PEOPLE, useSession, type Role } from '../lib/session';
import { Icon } from './Icon';
import { Avatar } from './ui';

const NOTIFS = [
  { t: 'SLA in 4 min — Bilal Hussain (Facebook) not yet called', m: 'Just now', alert: true },
  { t: 'Hold on A-1203 expires in 1h — Sadia Rehman', m: '12 min ago', alert: true },
  { t: 'Zubair Qureshi opened the payment plan for B-702 again', m: '40 min ago', alert: false },
];

export function AppTopBar() {
  const s = useSession();
  const nav = useNavigate();
  // Org switcher only renders for users with access to 2+ organisations (agency staff).
  const multiOrg = s.role !== 'finance' && s.role !== 'dealer';

  const org = usePopover();
  const proj = usePopover();
  const notif = usePopover();
  const user = usePopover();
  const find = usePopover();

  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const hits = search(q);
  const setFindOpen = find.setOpen;

  // Ctrl/⌘ K focuses global search.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setFindOpen(true);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [setFindOpen]);

  const groups = (['Leads', 'Contacts', 'Units', 'Bookings'] as const)
    .map((g) => ({ g, items: hits.filter((h) => h.group === g) }))
    .filter((x) => x.items.length);

  const go = (h: SearchHit) => {
    find.setOpen(false);
    setQ('');
    nav(h.to);
  };

  return (
    <header className="topbar">
      <Link to={LANDING[s.role]} className="topbar__brand" aria-label="Ehata home">
        <span className="logo-mark">E</span>
        <span className="logo-word">Ehata</span>
      </Link>

      {multiOrg && (
        <div className="topbar__switch topbar__org" ref={org.ref}>
          <button type="button" className="topbar__btn" aria-label="Switch organisation" aria-expanded={org.open} onClick={org.toggle}>
            <span className="topbar__org-mark">{s.org.mark}</span>
            <span className="ellipsis">{s.org.name}</span>
            <Icon name="chevronDown" size={14} color="var(--on-brand-muted)" />
          </button>
          {org.open && (
            <div className="menu" style={{ top: 42, left: 0, width: 320 }} role="menu" aria-label="Organisations">
              <div className="menu__label">Switching keeps this screen and clears filters</div>
              {ORGS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={o.id === s.orgId}
                  className="menu__item"
                  style={{ minHeight: 48 }}
                  onClick={() => {
                    s.setOrg(o.id);
                    org.setOpen(false);
                  }}
                >
                  <span className="avatar avatar--24 avatar--dark" style={{ borderRadius: 4 }}>
                    {o.mark}
                  </span>
                  <span className="col min0">
                    <span className="ellipsis strong">{o.name}</span>
                    <span className="small muted ellipsis">{o.projects.join(' · ')}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {multiOrg && (
        <svg className="topbar__slash" width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="var(--brand-700)" strokeWidth="1.5" aria-hidden="true">
          <path d="M3 18L9 2" />
        </svg>
      )}

      <div className="topbar__switch topbar__project" ref={proj.ref}>
        <button type="button" className="topbar__btn topbar__btn--fill" aria-label="Switch project" aria-expanded={proj.open} onClick={proj.toggle}>
          <span className="topbar__muted">Project</span>
          <span className="ellipsis strong">{s.project}</span>
          <Icon name="chevronDown" size={14} color="var(--on-brand-muted)" />
        </button>
        {proj.open && (
          <div className="menu" style={{ top: 42, left: 0 }} role="menu" aria-label="Projects">
            {s.org.projects.map((p) => (
              <button
                key={p}
                type="button"
                role="menuitemradio"
                aria-checked={p === s.project}
                className="menu__item"
                onClick={() => {
                  s.setProject(p);
                  proj.setOpen(false);
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="topbar__search-wrap" ref={find.ref}>
        <label className="topbar__search">
          <Icon name="search" />
          <input
            ref={inputRef}
            aria-label="Global search"
            placeholder="Search name, phone, CNIC or unit code"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              find.setOpen(true);
            }}
            onFocus={() => find.setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && hits[0]) go(hits[0]);
            }}
          />
          <span className="kbd topbar__kbd">Ctrl K</span>
        </label>
        {find.open && q.trim().length >= 2 && (
          <div className="menu search-results" role="listbox" aria-label="Search results">
            {groups.length === 0 && <div className="menu__label" style={{ padding: 12 }}>No matches for “{q}”. Try a phone number or unit code.</div>}
            {groups.map(({ g, items }) => (
              <div key={g}>
                <div className="menu__label">{g}</div>
                {items.map((h) => (
                  <button key={h.title + h.meta} type="button" role="option" aria-selected="false" className="menu__item" onClick={() => go(h)}>
                    <span className="col min0">
                      <span className="strong ellipsis">{h.title}</span>
                      <span className="small muted ellipsis">{h.meta}</span>
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="topbar__switch" ref={notif.ref}>
        <button type="button" className="topbar__icon" aria-label={`Notifications, ${NOTIFS.length} unread`} aria-expanded={notif.open} onClick={notif.toggle}>
          <Icon name="bell" size={20} stroke={1.8} />
          <span className="topbar__badge">{NOTIFS.length}</span>
        </button>
        {notif.open && (
          <div className="menu" style={{ top: 46, right: 0, width: 340 }} role="menu" aria-label="Notifications">
            <div className="menu__label">Notifications</div>
            {NOTIFS.map((n) => (
              <Link key={n.t} to="/my-day" role="menuitem" className="menu__item" style={{ alignItems: 'flex-start', padding: '10px 12px' }} onClick={() => notif.setOpen(false)}>
                <Icon name={n.alert ? 'warn' : 'info'} size={14} color={n.alert ? 'var(--danger)' : 'var(--text-muted)'} style={{ marginTop: 3 }} />
                <span className="col">
                  <span>{n.t}</span>
                  <span className="small muted">{n.m}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="topbar__switch" ref={user.ref}>
        <button type="button" className="topbar__user" aria-label="User menu" aria-expanded={user.open} onClick={user.toggle}>
          <Avatar initials={s.person.initials} />
          <span className="topbar__who">
            <span className="strong">{s.person.name}</span>
            <span className="topbar__muted">{s.person.roleLabel}</span>
          </span>
        </button>
        {user.open && (
          <div className="menu" style={{ top: 46, right: 0, width: 260 }} role="menu" aria-label="User menu">
            <div className="menu__label">View as (demo)</div>
            {(Object.keys(PEOPLE) as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                role="menuitemradio"
                aria-checked={r === s.role}
                className="menu__item"
                onClick={() => {
                  s.setRole(r);
                  user.setOpen(false);
                  nav(LANDING[r]);
                }}
              >
                <span className="avatar avatar--24">{PEOPLE[r].initials}</span>
                <span className="col">
                  <span className="strong">{PEOPLE[r].name}</span>
                  <span className="small muted">{PEOPLE[r].roleLabel}</span>
                </span>
              </button>
            ))}
            <div className="menu__sep" />
            <button type="button" role="menuitem" className="menu__item" onClick={() => s.setTheme(s.theme === 'dark' ? 'light' : 'dark')}>
              <Icon name={s.theme === 'dark' ? 'sun' : 'moon'} />
              {s.theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            <Link to="/design-system" role="menuitem" className="menu__item" onClick={() => user.setOpen(false)}>
              <Icon name="grid" />
              Design system
            </Link>
            <button
              type="button"
              role="menuitem"
              className="menu__item"
              onClick={() => {
                s.signOut();
                nav('/login');
              }}
            >
              <Icon name="logout" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
