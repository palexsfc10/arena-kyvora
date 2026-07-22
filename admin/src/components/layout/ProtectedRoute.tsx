import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { LoadingState } from "../ui/LoadingState";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, isLoading, isForbidden } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState fullScreen message="Verificando sessão..." />;
  }

  if (isForbidden) {
    return <Navigate to="/access-denied" replace />;
  }

  if (!session) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <>{children}</>;
}
