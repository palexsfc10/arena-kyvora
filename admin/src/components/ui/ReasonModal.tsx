import { useState, type ReactNode } from "react";

import { Button } from "./Button";
import { Modal } from "./Modal";

interface ReasonModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  confirmVariant?: "primary" | "danger";
  extraFields?: ReactNode;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
}

export function ReasonModal({
  open,
  title,
  description,
  confirmLabel,
  confirmVariant = "primary",
  extraFields,
  loading = false,
  onClose,
  onConfirm,
}: ReasonModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (reason.trim().length < 10) {
      setError("O motivo deve ter no mínimo 10 caracteres.");
      return;
    }
    setError(null);
    await onConfirm(reason.trim());
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    setError(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      title={title}
      onClose={handleClose}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant={confirmVariant}
            loading={loading}
            onClick={() => void handleConfirm()}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {description ? (
        <p className="mb-4 text-sm text-slate-400">{description}</p>
      ) : null}
      {extraFields}
      <label className="admin-label">
        Motivo (obrigatório)
        <textarea
          className="admin-input mt-1 min-h-[96px]"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Descreva o motivo desta ação..."
        />
      </label>
      {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
    </Modal>
  );
}
