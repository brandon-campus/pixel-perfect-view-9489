import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface User { name: string; email: string; barrio?: string }
interface Ctx { user: User | null; ready: boolean; login: (u: User) => void; logout: () => void }
const AuthCtx = createContext<Ctx>({ user: null, ready: false, login: () => {}, logout: () => {} });
const KEY = "jama-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setUser(JSON.parse(raw));
    setReady(true);
  }, []);
  return (
    <AuthCtx.Provider
      value={{
        user,
        ready,
        login: (u) => { localStorage.setItem(KEY, JSON.stringify(u)); setUser(u); },
        logout: () => { localStorage.removeItem(KEY); setUser(null); },
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}
export const useAuth = () => useContext(AuthCtx);
