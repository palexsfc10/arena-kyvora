import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ARENA_PLATFORM_ADMIN_ROLE,
  fetchAdminSession,
  loginRequest,
  logoutRequest,
  type AdminSession,
  type LoginPayload,
} from "../lib/admin-api";
import {
  bootstrapAccessToken,
  persistAccessToken,
  setAccessToken,
} from "../lib/api-client";
import { clearStoredAccessToken } from "../lib/auth-storage";

interface AuthContextValue {
  /** The current admin session, or null if not authenticated. */
  session: AdminSession | null;
  /** True while the initial session bootstrap is running. */
  isLoading: boolean;
  /** True once authenticated but the session role lacks admin access. */
  isForbidden: boolean;
  login: (payload: LoginPayload) => Promise<AdminSession>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function hasAdminRole(session: AdminSession): boolean {
  return session.role === ARENA_PLATFORM_ADMIN_ROLE;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isForbidden, setIsForbidden] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const token = bootstrapAccessToken();
    if (!token) {
      setSession(null);
      setIsForbidden(false);
      return;
    }
    const current = await fetchAdminSession();
    if (!hasAdminRole(current)) {
      setSession(null);
      setIsForbidden(true);
      return;
    }
    setIsForbidden(false);
    setSession(current);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadSession();
      } catch {
        clearStoredAccessToken();
        setAccessToken(null);
        if (mounted) {
          setSession(null);
          setIsForbidden(false);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loadSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    const tokenData = await loginRequest(payload);
    setAccessToken(tokenData.access_token);
    try {
      const current = await fetchAdminSession();
      if (!hasAdminRole(current)) {
        setAccessToken(null);
        setIsForbidden(true);
        setSession(null);
        throw new Error("FORBIDDEN");
      }
      persistAccessToken(tokenData.access_token);
      setIsForbidden(false);
      setSession(current);
      return current;
    } catch (error) {
      clearStoredAccessToken();
      setAccessToken(null);
      setSession(null);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      clearStoredAccessToken();
      setAccessToken(null);
      setSession(null);
      setIsForbidden(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    await loadSession();
  }, [loadSession]);

  const value = useMemo<AuthContextValue>(
    () => ({ session, isLoading, isForbidden, login, logout, refreshSession }),
    [session, isLoading, isForbidden, login, logout, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
