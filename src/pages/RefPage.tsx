import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const LINKS = [
  ['/design-system', 'Design system'],
  ['/states', 'States'],
  ['/roles', 'Roles'],
  ['/m', 'Agent mobile'],
  ['/site', 'Public site'],
];

/** Frame for reference screens from the design canvas (no app shell). */
export function RefPage({ title, sub, children }: { title: string; sub: ReactNode; children: ReactNode }) {
  return (
    <div className="ref-page">
      <nav aria-label="Reference screens" className="row-wrap small" style={{ gap: 16 }}>
        <Link to="/" className="row strong" style={{ gap: 8, color: 'var(--text)', textDecoration: 'none' }}>
          <span className="logo-mark logo-mark--on-light" style={{ width: 24, height: 24, fontSize: 13 }}>
            E
          </span>
          Back to app
        </Link>
        <span className="spacer" />
        {LINKS.map(([to, l]) => (
          <Link key={to} to={to}>
            {l}
          </Link>
        ))}
      </nav>
      <div>
        <h1 className="t-h1">{title}</h1>
        <span className="muted">{sub}</span>
      </div>
      {children}
    </div>
  );
}
