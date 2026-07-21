"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { brand } from "@/content/site";
import { ApiError } from "@/lib/api-client";
import * as arenaApi from "@/lib/arena-api";

function VerificarEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Confirmando e-mail…");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Link inválido. Solicite um novo e-mail de verificação.");
      return;
    }
    void (async () => {
      try {
        await arenaApi.verifyEmailArena(token);
        setStatus("ok");
        setMessage("E-mail confirmado. Você já pode entrar no Arena.");
      } catch (err) {
        setStatus("error");
        setMessage(
          err instanceof ApiError
            ? err.message
            : "Não foi possível confirmar o e-mail.",
        );
      }
    })();
  }, [token]);

  return (
    <div className="min-h-dvh bg-canvas">
      <Container className="flex min-h-dvh max-w-md flex-col justify-center py-10">
        <Link href="/" className="mb-8 font-display text-xl font-semibold">
          {brand.name}
        </Link>
        <h1 className="font-display text-2xl font-semibold">Verificação de e-mail</h1>
        <p
          className={`mt-3 text-sm ${status === "error" ? "text-red-700" : "text-muted"}`}
          role="status"
        >
          {message}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          {status === "ok" ? (
            <Button href="/entrar">Entrar</Button>
          ) : (
            <>
              <Button href="/entrar" variant="outline">
                Ir para Entrar
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.replace("/verificacao-pendente")}
              >
                Reenviar verificação
              </Button>
            </>
          )}
        </div>
      </Container>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-canvas text-sm text-muted">
          Carregando…
        </div>
      }
    >
      <VerificarEmailContent />
    </Suspense>
  );
}
