import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Role = 'agent' | 'manager' | 'admin' | 'dealer' | 'finance';
export type Theme = 'light' | 'dark';

export type Person = { name: string; initials: string; roleLabel: string };

export const PEOPLE: Record<Role, Person> = {
  agent: { name: 'Usman Tariq', initials: 'UT', roleLabel: 'Agent' },
  manager: { name: 'Ayesha Khan', initials: 'AK', roleLabel: 'Sales Manager' },
  admin: { name: 'Sana Malik', initials: 'SM', roleLabel: 'Owner/Admin' },
  dealer: { name: 'Al-Noor Estate', initials: 'AN', roleLabel: 'Dealer' },
  finance: { name: 'Rashid Mahmood', initials: 'RM', roleLabel: 'Finance' },
};

export type Org = { id: string; mark: string; name: string; projects: string[] };

export const ORGS: Org[] = [
  { id: 'saffron', mark: 'S', name: 'Saffron Developers', projects: ['Saffron Residencia', 'Saffron Gardens'] },
  { id: 'margalla', mark: 'M', name: 'Margalla Crest Builders', projects: ['Crest Heights Tower B'] },
  { id: 'rawal', mark: 'R', name: 'Rawal Enclave Housing Society (Pvt) Ltd — Phase II Extension', projects: ['Rawal Enclave Phase II'] },
];

type Session = {
  signedIn: boolean;
  role: Role;
  person: Person;
  orgId: string;
  org: Org;
  project: string;
  theme: Theme;
  signIn: (orgId: string) => void;
  signOut: () => void;
  setRole: (r: Role) => void;
  setOrg: (id: string) => void;
  setProject: (p: string) => void;
  setTheme: (t: Theme) => void;
};

const Ctx = createContext<Session | null>(null);

const KEY = 'ehata.session.v1';

type Stored = { signedIn: boolean; role: Role; orgId: string; project: string; theme: Theme };

function load(): Stored {
  const fallback: Stored = { signedIn: true, role: 'manager', orgId: 'saffron', project: 'Saffron Residencia', theme: 'light' };
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...fallback, ...(JSON.parse(raw) as Partial<Stored>) } : fallback;
  } catch {
    return fallback;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<Stored>(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable: session still works in memory */
    }
    document.documentElement.dataset.theme = state.theme;
  }, [state]);

  const patch = useCallback((p: Partial<Stored>) => setState((s) => ({ ...s, ...p })), []);

  const value = useMemo<Session>(() => {
    const org = ORGS.find((o) => o.id === state.orgId) ?? ORGS[0];
    return {
      ...state,
      org,
      person: PEOPLE[state.role],
      signIn: (orgId) => {
        const o = ORGS.find((x) => x.id === orgId) ?? ORGS[0];
        patch({ signedIn: true, orgId: o.id, project: o.projects[0] });
      },
      signOut: () => patch({ signedIn: false }),
      setRole: (role) => patch({ role }),
      // Switching org keeps the current screen and clears filters (filters are page state).
      setOrg: (id) => {
        const o = ORGS.find((x) => x.id === id) ?? ORGS[0];
        patch({ orgId: o.id, project: o.projects[0] });
      },
      setProject: (project) => patch({ project }),
      setTheme: (theme) => patch({ theme }),
    };
  }, [state, patch]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useSession must be used inside SessionProvider');
  return s;
}
