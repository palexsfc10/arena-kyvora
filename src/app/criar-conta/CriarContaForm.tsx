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

export default function CriarContaForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Informe seu nome completo.";
    if (!email.includes("@")) next.email = "Informe um e-mail válido.";
    if (password.length < 8) next.password = "A senha deve ter pelo menos 8 caracteres.";
    if (password !== confirm) next.confirm = "As senhas não coincidem.";
    if (!acceptTerms) next.terms = "Aceite os termos para continuar.";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!validate()) return;
    setSubmitting(true);
    trackEvent("arena_register_started");
    try {
      await arenaApi.registerArena({
        name: name.trim(),
        email: email.trim(),
        password,
        confirm_password: confirm,
        accept_terms: acceptTerms,
      });
      trackEvent("arena_register_completed");
      router.replace(`/verificacao-pendente?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Este e-mail já possui conta. Entre ou recupere sua senha.");
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "Não foi possível criar a conta. Tente novamente.",
        );
      }
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
        <h1 className="font-display text-2xl font-semibold text-ink">
          Criar conta grátis
        </h1>
        <p className="mt-2 text-sm text-muted">
          Cadastre-se no Arena para encontrar times e marcar jogos. Sem cartão,
          sem assinatura.
        </p>
        <form className="mt-8 space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
              Nome
            </label>
            <input
              id="name"
              name="name"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-invalid={Boolean(fieldErrors.name)}
              aria-describedby={fieldErrors.name ? "name-error" : undefined}
            />
            {fieldErrors.name ? (
              <p id="name-error" className="mt-1 text-sm text-red-700" role="alert">
                {fieldErrors.name}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
            />
            {fieldErrors.email ? (
              <p id="email-error" className="mt-1 text-sm text-red-700" role="alert">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-describedby="password-hint password-error"
            />
            <p id="password-hint" className="mt-1 text-xs text-muted">
              Mínimo de 8 caracteres.
            </p>
            {fieldErrors.password ? (
              <p id="password-error" className="mt-1 text-sm text-red-700" role="alert">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium">
              Confirmar senha
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-invalid={Boolean(fieldErrors.confirm)}
              aria-describedby={fieldErrors.confirm ? "confirm-error" : undefined}
            />
            {fieldErrors.confirm ? (
              <p id="confirm-error" className="mt-1 text-sm text-red-700" role="alert">
                {fieldErrors.confirm}
              </p>
            ) : null}
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1"
              aria-invalid={Boolean(fieldErrors.terms)}
              aria-describedby={fieldErrors.terms ? "terms-error" : undefined}
            />
            <span>
              Li e aceito os{" "}
              <Link href="/termos" className="underline underline-offset-2">
                Termos
              </Link>{" "}
              e a{" "}
              <Link href="/privacidade" className="underline underline-offset-2">
                Política de Privacidade
              </Link>
              .
            </span>
          </label>
          {fieldErrors.terms ? (
            <p id="terms-error" className="text-sm text-red-700" role="alert">
              {fieldErrors.terms}
            </p>
          ) : null}
          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Criando conta…" : "Criar conta"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted">
          Já tem conta?{" "}
          <Link href="/entrar" className="font-medium text-ink underline-offset-2 hover:underline">
            Entrar
          </Link>
        </p>
      </Container>
    </div>
  );
}
