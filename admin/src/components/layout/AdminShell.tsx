import { useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";
import { Badge } from "../ui/Badge";

interface NavItem {
  to: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Visão geral" },
  { to: "/teams", label: "Times" },
  { to: "/users", label: "Usuários" },
  { to: "/challenges", label: "Desafios" },
  { to: "/moderation", label: "Moderação" },
  { to: "/announcements", label: "Avisos" },
  { to: "/audit", label: "Auditoria" },
  { to: "/settings", label: "Configurações" },
];

const isStaging = import.meta.env.VITE_APP_ENV === "staging";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <ul className="space-y-1">
      {NAV_ITEMS.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            end={item.to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-slate-800 text-white"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              }`
            }
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

interface AdminShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function AdminShell({ title, subtitle, children, actions }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950 transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-slate-800 px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-sky-400">
                Arena Kyvora
              </p>
              <p className="mt-1 text-lg font-semibold text-white">Admin</p>
            </div>
            {isStaging ? <Badge tone="warning">HML</Badge> : null}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <NavList onNavigate={() => setSidebarOpen(false)} />
        </nav>

        <div className="border-t border-slate-800 px-4 py-3 text-xs text-slate-500">
          Painel administrativo · Arena
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 lg:px-6">
            <button
              type="button"
              className="rounded-md border border-slate-700 px-2 py-1 text-slate-300 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Abrir menu"
            >
              ≡
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-semibold text-slate-100 lg:text-lg">
                  {title}
                </h1>
                {isStaging ? (
                  <Badge tone="warning" className="lg:hidden">
                    HML
                  </Badge>
                ) : null}
              </div>
              {subtitle ? (
                <p className="truncate text-xs text-slate-500">{subtitle}</p>
              ) : null}
            </div>

            {actions ? <div className="flex items-center gap-2">{actions}</div> : null}

            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span className="hidden sm:inline">{session?.user.name ?? "Operador"}</span>
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => void handleLogout()}
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
