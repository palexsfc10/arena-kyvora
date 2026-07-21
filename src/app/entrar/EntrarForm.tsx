"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { brand } from "@/content/site";
import { ApiError } from "@/lib/api-client";
import * as arenaApi from "@/lib/arena-api";
import { trackEvent } from "@/lib/analytics";
import { routeAfterSession } from "@/lib/arena-routing";

export default function EntrarForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    trackEvent("arena_login_started");
    try {
      await arenaApi.login(email.trim(), password);
      let session = await arenaApi.getSession();
      if (session.teams.length === 1) {
        await arenaApi.selectTeam(session.teams[0].organization_id);
        trackEvent("arena_team_selected", { team_count: 1 });
        session = await arenaApi.getSession();
      } else if (
        session.selected_organization_id &&
        session.teams.some((t) => t.organization_id === session.selected_organization_id)
      ) {
        await arenaApi.selectTeam(session.selected_organization_id);
        session = await arenaApi.getSession();
      }
      router.replace(routeAfterSession(session));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível entrar. Verifique e-mail e senha.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <Container className="flex min-h-dvh max-w-md flex-col justify-center py-10">
        <Link
          href="/"
          className="mb-8 font-display text-xl font-semibold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {brand.name}
        </Link>
        <h1 className="font-display text-2xl font-semibold text-ink">Entrar</h1>
        <p className="mt-2 text-sm text-muted">
          Acesse com sua conta do Arena Kyvora.
        </p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "login-error" : undefined}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>
          {error ? (
            <p id="login-error" className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Entrando…" : "Entrar no Arena"}
          </Button>
        </form>
        <div className="mt-6 space-y-2 text-sm text-muted">
          <p>
            <Link
              href="/esqueci-senha"
              className="font-medium text-ink underline-offset-2 hover:underline"
            >
              Esqueci minha senha
            </Link>
          </p>
          <p>
            Ainda não tem conta?{" "}
            <Link
              href="/criar-conta"
              className="font-medium text-ink underline-offset-2 hover:underline"
            >
              Criar conta no Arena
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
