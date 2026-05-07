"use client";

/**
 * AuthContext: provides the current user and helpers for login / logout
 * throughout the app.  State is persisted in localStorage (JWT) and synced
 * on mount so the session survives a page refresh.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { auth as authApi, type User } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /** Persist the token and load the user profile. */
  const login = useCallback(async (token: string) => {
    localStorage.setItem("token", token);
    const me = await authApi.me();
    setUser(me);
  }, []);

  /** Clear token and user state. */
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  /** On mount, attempt to rehydrate from stored token. */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
