interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingState({
  message = "Carregando...",
  fullScreen = false,
}: LoadingStateProps) {
  return (
    <div
      className={`flex items-center justify-center text-sm text-slate-400 ${
        fullScreen ? "min-h-screen" : "py-12"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-sky-500" />
        {message}
      </div>
    </div>
  );
}
