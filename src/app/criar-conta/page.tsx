import { Suspense } from "react";
import type { Metadata } from "next";
import CriarContaForm from "./CriarContaForm";

export const metadata: Metadata = {
  title: "Criar conta — Arena Kyvora",
  robots: { index: false, follow: false },
};

export default function CriarContaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-canvas text-sm text-muted">
          Carregando…
        </div>
      }
    >
      <CriarContaForm />
    </Suspense>
  );
}
