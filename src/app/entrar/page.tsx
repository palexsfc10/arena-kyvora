import { Suspense } from "react";
import type { Metadata } from "next";
import EntrarForm from "./EntrarForm";

export const metadata: Metadata = {
  title: "Entrar — Arena Kyvora",
  robots: { index: false, follow: false },
};

export default function EntrarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-canvas text-sm text-muted">
          Carregando…
        </div>
      }
    >
      <EntrarForm />
    </Suspense>
  );
}
