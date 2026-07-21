import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AppShell } from "@/components/app/AppShell";

export const metadata: Metadata = {
  title: "Arena Kyvora — Área interna",
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
