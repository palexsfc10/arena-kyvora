"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { brand } from "@/content/site";
import { ApiError } from "@/lib/api-client";
import * as arenaApi from "@/lib/arena-api";
import { getAccessToken } from "@/lib/auth-storage";

function VerificacaoPendenteContent() {
  const params = useSearchParams();
  const email = params.get("email");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function resend() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (!getAccessToken()) {
        setMessage(
          "Abra o link do e-mail para confirmar. Depois disso, você poderá entrar.",
        );
        return;
      }
      await arenaApi.resendVerificationArena();
      setMessage("Se necessário, reenviamos o e-mail de verificação.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível reenviar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <Container className="flex min-h-dvh max-w-md flex-col justify-center py-10">
        <Link href="/" className="mb-8 font-display text-xl font-semibold text-ink">
          {brand.name}
        </Link>
        <h1 className="font-display text-2xl font-semibold">Confirme seu e-mail</h1>
        <p className="mt-3 text-sm text-muted">
          Enviamos um link de confirmação
          {email ? (
            <>
              {" "}
              para <strong className="text-ink">{email}</strong>
            </>
          ) : null}
          . Abra o e-mail e continue no Arena.
        </p>
        {message ? (
          <p className="mt-4 text-sm text-ink-soft" role="status">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}
        <div className="mt-8 flex flex-col gap-3">
          <Button href="/entrar">Já confirmei — Entrar</Button>
          <Button type="button" variant="outline" disabled={loading} onClick={() => void resend()}>
            {loading ? "Enviando…" : "Reenviar e-mail"}
          </Button>
        </div>
      </Container>
    </div>
  );
}

export default function VerificacaoPendentePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-canvas text-sm text-muted">
          Carregando…
        </div>
      }
    >
      <VerificacaoPendenteContent />
    </Suspense>
  );
}
