import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
}

export function Modal({ open, title, children, onClose, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-slate-950/70"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
        <div className="border-b border-slate-800 px-4 py-3">
          <h2 className="text-base font-semibold text-slate-100">{title}</h2>
        </div>
        <div className="px-4 py-4">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-2 border-t border-slate-800 px-4 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
