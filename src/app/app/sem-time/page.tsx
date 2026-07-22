"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function SemTimePage() {
  const { session, logout } = useAuth();

  return (
    <Container className="py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">
        Cadastre seu time
      </h1>
      <p className="mt-3 max-w-lg text-sm text-muted">
        Olá{session ? `, ${session.user_name}` : ""}. Para explorar jogos e desafiar
        adversários, crie o time que você representa no Arena. Leva poucos minutos.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/app/criar-time">Criar meu time</Button>
        <Button type="button" variant="outline" onClick={() => void logout()}>
          Entrar com outra conta
        </Button>
      </div>
    </Container>
  );
}
