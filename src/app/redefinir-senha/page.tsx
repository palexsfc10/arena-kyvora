"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { brand } from "@/content/site";
import { ApiError } from "@/lib/api-client";
import * as arenaApi from "@/lib/arena-api";

function RedefinirSenhaForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!token) {
      setError("Link inválido ou expirado.");
      return;
    }
    setSubmitting(true);
    try {
      await arenaApi.resetPasswordArena({
        token,
        password,
        confirm_password: confirm,
      });
      router.replace("/entrar");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível redefinir.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <Container className="flex min-h-dvh max-w-md flex-col justify-center py-10">
        <Link href="/" className="mb-8 font-display text-xl font-semibold">
          {brand.name}
        </Link>
        <h1 className="font-display text-2xl font-semibold">Redefinir senha</h1>
        <form className="mt-8 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Nova senha</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium">Confirmar senha</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            />
          </label>
          {error ? (
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Salvando…" : "Salvar nova senha"}
          </Button>
        </form>
      </Container>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-canvas text-sm text-muted">
          Carregando…
        </div>
      }
    >
      <RedefinirSenhaForm />
    </Suspense>
  );
}
