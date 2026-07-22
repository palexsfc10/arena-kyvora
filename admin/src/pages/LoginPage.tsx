import { useState, type FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { LoadingState } from "../components/ui/LoadingState";
import { Button } from "../components/ui/Button";
import { ApiError } from "../lib/api-client";

export function LoginPage() {
  const { session, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) {
    return <LoadingState fullScreen message="Verificando sessão..." />;
  }

  if (session) {
    const redirect = searchParams.get("redirect");
    return <Navigate to={redirect ? decodeURIComponent(redirect) : "/"} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      const redirect = searchParams.get("redirect");
      navigate(redirect ? decodeURIComponent(redirect) : "/", { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível fazer login. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
          Arena Kyvora
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Painel Administrativo</h1>
        <p className="mt-2 text-sm text-slate-400">
          Acesso restrito a administradores da plataforma Arena.
        </p>

        <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <label className="admin-label">
            E-mail
            <input
              type="email"
              autoComplete="username"
              required
              className="admin-input mt-1"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="admin-label">
            Senha
            <input
              type="password"
              autoComplete="current-password"
              required
              className="admin-input mt-1"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button type="submit" className="w-full" loading={submitting}>
            {submitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
