"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { brand } from "@/content/site";
import { ApiError } from "@/lib/api-client";
import * as arenaApi from "@/lib/arena-api";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await arenaApi.forgotPasswordArena(email.trim());
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível enviar.");
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
        <h1 className="font-display text-2xl font-semibold">Esqueci minha senha</h1>
        <p className="mt-2 text-sm text-muted">
          Informe seu e-mail. Se houver conta, enviaremos instruções.
        </p>
        {done ? (
          <p className="mt-6 text-sm text-ink-soft" role="status">
            Se o e-mail existir, você receberá o link em breve.
          </p>
        ) : (
          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium">E-mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-line bg-white px-3 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </label>
            {error ? (
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Enviando…" : "Enviar link"}
            </Button>
          </form>
        )}
        <p className="mt-6 text-sm">
          <Link href="/entrar" className="underline-offset-2 hover:underline">
            Voltar para Entrar
          </Link>
        </p>
      </Container>
    </div>
  );
}
