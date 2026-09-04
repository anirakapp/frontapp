import type { ReactElement } from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps): ReactElement {
  return (
    <div className="cc-pagination">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1}>
        ← Anterior
      </button>
      <span>
        Página {page} de {totalPages}
      </span>
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages}>
        Siguiente →
      </button>
    </div>
  );
}