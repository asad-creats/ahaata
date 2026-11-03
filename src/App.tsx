import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { LANDING } from './lib/nav';
import { useSession } from './lib/session';
import { AgentHome } from './pages/AgentHome';
import { AgentMobile } from './pages/AgentMobile';
import { Bookings } from './pages/Bookings';
import { Dashboard } from './pages/Dashboard';
import { DesignSystem } from './pages/DesignSystem';
import { Heatmap } from './pages/Heatmap';
import { Inventory } from './pages/Inventory';
import { LeadProfile } from './pages/LeadProfile';
import { LeadsTable } from './pages/LeadsTable';
import { LeakFinder } from './pages/LeakFinder';
import { Login } from './pages/Login';
import { Pipeline } from './pages/Pipeline';
import { PublicMap } from './pages/PublicMap';
import { PublicUnit } from './pages/PublicUnit';
import { Roles } from './pages/Roles';
import { Scorecards } from './pages/Scorecards';
import { Settings } from './pages/Settings';
import { States } from './pages/States';

function Internal({ page, children, roomy }: { page: string; children: ReactNode; roomy?: boolean }) {
  const { signedIn } = useSession();
  if (!signedIn) return <Navigate to="/login" replace />;
  return (
    <AppShell page={page} roomy={roomy}>
      {children}
    </AppShell>
  );
}

function Home() {
  const { signedIn, role } = useSession();
  return <Navigate to={signedIn ? LANDING[role] : '/login'} replace />;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route path="/my-day" element={<Internal page="/my-day" roomy><AgentHome /></Internal>} />
      <Route path="/pipeline" element={<Internal page="/pipeline"><Pipeline /></Internal>} />
      <Route path="/leads" element={<Internal page="/leads"><LeadsTable /></Internal>} />
      <Route path="/leads/:id" element={<Internal page="/lead"><LeadProfile /></Internal>} />
      <Route path="/inventory" element={<Internal page="/inventory"><Inventory /></Internal>} />
      <Route path="/bookings" element={<Internal page="/bookings"><Bookings /></Internal>} />
      <Route path="/dashboard" element={<Internal page="/dashboard"><Dashboard /></Internal>} />
      <Route path="/leaks" element={<Internal page="/leaks"><LeakFinder /></Internal>} />
      <Route path="/heatmap" element={<Internal page="/heatmap"><Heatmap /></Internal>} />
      <Route path="/scorecards" element={<Internal page="/scorecards"><Scorecards /></Internal>} />
      <Route path="/settings" element={<Internal page="/settings"><Settings /></Internal>} />

      {/* Reference screens from the design canvas */}
      <Route path="/design-system" element={<DesignSystem />} />
      <Route path="/states" element={<States />} />
      <Route path="/roles" element={<Roles />} />

      {/* Agent mobile (390) */}
      <Route path="/m" element={<AgentMobile />} />
      <Route path="/m/:view" element={<AgentMobile />} />

      {/* Public inventory website (per developer, brandable) */}
      <Route path="/site" element={<PublicMap />} />
      <Route path="/site/unit/:code" element={<PublicUnit />} />

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
