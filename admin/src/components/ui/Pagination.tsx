import type { PaginationMeta } from "../../lib/admin-api";
import { Button } from "./Button";

interface PaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { page, total_pages, total_items, has_prev, has_next } = pagination;

  if (total_items === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4 text-sm text-slate-400">
      <p>
        Página {page} de {Math.max(total_pages, 1)} · {total_items} itens
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          disabled={!has_prev}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="secondary"
          disabled={!has_next}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  );
}
