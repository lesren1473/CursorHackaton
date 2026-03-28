import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'sportaj_demo_session';

export type DemoSession = {
  email: string;
};

function readStoredSession(): DemoSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as unknown;
    if (data && typeof data === 'object' && typeof (data as DemoSession).email === 'string') {
      return { email: (data as DemoSession).email };
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function initialsFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim() || '?';
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || '??';
}

export function displayNameFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim() || 'Korisnik';
  const cleaned = local.replace(/[._-]+/g, ' ').trim();
  if (!cleaned) return 'Korisnik';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

type AuthContextValue = {
  session: DemoSession | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  userInitials: string;
  userDisplayName: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<DemoSession | null>(() => readStoredSession());

  const login = useCallback((email: string, _password: string) => {
    const trimmed = email.trim();
    if (!trimmed) return false;
    const next: DemoSession = { email: trimmed.toLowerCase() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const email = session?.email ?? '';
    return {
      session,
      isAuthenticated: !!session,
      login,
      logout,
      userInitials: session ? initialsFromEmail(email) : '??',
      userDisplayName: session ? displayNameFromEmail(email) : 'Gost',
    };
  }, [session, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth mora biti unutar AuthProvider');
  }
  return ctx;
}
