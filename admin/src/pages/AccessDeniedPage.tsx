import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { useAuth } from "../contexts/AuthContext";

export function AccessDeniedPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleBackToLogin = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 text-center shadow-xl">
        <p className="text-xs font-medium uppercase tracking-wider text-red-400">
          Acesso negado
        </p>
        <h1 className="mt-2 text-xl font-semibold text-white">
          Você não tem permissão para acessar este painel
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          Esta área é exclusiva para contas com o papel de administrador da
          plataforma Arena. Se você acredita que isso é um erro, contate o
          time responsável.
        </p>
        <Button className="mt-6 w-full" onClick={() => void handleBackToLogin()}>
          Voltar para o login
        </Button>
      </div>
    </div>
  );
}
