"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import * as arenaApi from "@/lib/arena-api";
import { ApiError } from "@/lib/api-client";
import { clearAccessToken, getAccessToken } from "@/lib/auth-storage";
import type { ArenaSession, ArenaTeamSummary } from "@/lib/arena-types";
import { routeAfterSession } from "@/lib/arena-routing";
import { trackEvent } from "@/lib/analytics";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

type AuthContextValue = {
  status: AuthStatus;
  session: ArenaSession | null;
  selectedTeam: ArenaTeamSummary | null;
  error: string | null;
  pendingReceived: number;
  unreadNotifications: number;
  refreshSession: () => Promise<ArenaSession | null>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  selectTeam: (organizationId: string) => Promise<void>;
  refreshPending: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [session, setSession] = useState<ArenaSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingReceived, setPendingReceived] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  const selectedTeam = useMemo(() => {
    if (!session?.selected_organization_id) return null;
    return (
      session.teams.find(
        (team) => team.organization_id === session.selected_organization_id,
      ) ?? null
    );
  }, [session]);

  const refreshPending = useCallback(async () => {
    if (!session?.selected_organization_id) {
      setPendingReceived(0);
      return;
    }
    try {
      const data = await arenaApi.pendingCount(session.selected_organization_id);
      setPendingReceived(data.pending_received);
    } catch {
      // ignore badge errors
    }
  }, [session?.selected_organization_id]);

  const refreshNotifications = useCallback(async () => {
    if (!session?.selected_organization_id) {
      setUnreadNotifications(0);
      return;
    }
    try {
      const data = await arenaApi.unreadNotificationCount(
        session.selected_organization_id,
      );
      setUnreadNotifications(data.unread_count);
    } catch {
      // ignore badge errors
    }
  }, [session?.selected_organization_id]);

  const refreshSession = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setSession(null);
      setStatus("unauthenticated");
      return null;
    }
    try {
      const data = await arenaApi.getSession();
      setSession(data);
      setStatus("authenticated");
      setError(null);
      return data;
    } catch (err) {
      clearAccessToken();
      setSession(null);
      if (err instanceof ApiError && err.status === 401) {
        setStatus("unauthenticated");
      } else {
        setStatus("error");
        setError(
          err instanceof Error ? err.message : "Falha ao carregar a sessão.",
        );
      }
      return null;
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    void refreshPending();
    void refreshNotifications();
  }, [refreshPending, refreshNotifications, pathname]);

  const login = useCallback(
    async (email: string, password: string) => {
      trackEvent("arena_login_started");
      await arenaApi.login(email, password);
      let data = await refreshSession();
      if (!data) throw new Error("Sessão inválida após login.");
      if (data.teams.length === 1) {
        await arenaApi.selectTeam(data.teams[0].organization_id);
        trackEvent("arena_team_selected", { team_count: 1 });
        data = (await refreshSession()) ?? data;
      } else if (data.selected_organization_id) {
        await arenaApi.selectTeam(data.selected_organization_id);
        data = (await refreshSession()) ?? data;
      }
      router.replace(routeAfterSession(data));
    },
    [refreshSession, router],
  );

  const logout = useCallback(async () => {
    await arenaApi.logout();
    setSession(null);
    setStatus("unauthenticated");
    setPendingReceived(0);
    setUnreadNotifications(0);
    router.replace("/entrar");
  }, [router]);

  const selectTeam = useCallback(
    async (organizationId: string) => {
      await arenaApi.selectTeam(organizationId);
      trackEvent("arena_team_selected");
      const data = await refreshSession();
      if (data) {
        router.replace(routeAfterSession(data));
      } else {
        router.replace("/app/explorar");
      }
    },
    [refreshSession, router],
  );

  const value = useMemo(
    () => ({
      status,
      session,
      selectedTeam,
      error,
      pendingReceived,
      unreadNotifications,
      refreshSession,
      login,
      logout,
      selectTeam,
      refreshPending,
      refreshNotifications,
    }),
    [
      status,
      session,
      selectedTeam,
      error,
      pendingReceived,
      unreadNotifications,
      refreshSession,
      login,
      logout,
      selectTeam,
      refreshPending,
      refreshNotifications,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
