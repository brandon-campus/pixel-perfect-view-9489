import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface User {
  id: string;
  name: string;
  email: string;
  barrio?: string;
}

interface Ctx {
  user: User | null;
  isAdmin: boolean;
  ready: boolean;
  login: (u: User) => void;
  logout: () => void;
}

const AuthCtx = createContext<Ctx>({
  user: null,
  isAdmin: false,
  ready: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 1. Obtener la sesión actual al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setReady(true);
      }
    });

    // 2. Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setUser(null);
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: SupabaseUser) => {
    try {
      const [{ data, error }, { data: adminData }] = await Promise.all([
        supabase.from("usuarios").select("*").eq("id", authUser.id).single(),
        supabase.rpc("es_admin"),
      ]);

      setIsAdmin(!!adminData);
        
      if (data && !error) {
        setUser({
          id: data.id,
          name: data.nombre,
          email: data.email,
        });
      } else {
        setUser({
          id: authUser.id,
          name: authUser.user_metadata?.['full_name'] || authUser.email?.split("@")[0] || "",
          email: authUser.email || "",
        });
      }
    } catch (e) {
      console.error(e);
      setIsAdmin(false);
    } finally {
      setReady(true);
    }
  };

  const login = (u: User) => {
    setUser(u);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthCtx.Provider value={{ user, isAdmin, ready, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
