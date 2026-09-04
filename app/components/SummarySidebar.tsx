import type { ReactElement } from "react";
import type { CalculoResponse } from "../lib/types";

interface SummarySidebarProps {
  personas: number;
  resultado: CalculoResponse | null;
  loading: boolean;
}

export default function SummarySidebar({
  personas,
  resultado,
  loading,
}: SummarySidebarProps): ReactElement {
  return (
    <aside className="cc-sidebar" aria-live="polite">
      <div className="cc-sidebar__box">
        <p className="cc-sidebar__label">Tu compra para</p>
        <p className="cc-sidebar__personas">{personas} personas</p>

        <h3 className="cc-sidebar__resumen-title">Resumen</h3>

        {loading && <p className="cc-sidebar__hint">Calculando con el backend…</p>}

        {!loading && !resultado && (
          <p className="cc-sidebar__hint">
            Completá los datos y tocá &quot;Calcular mi compra&quot; para ver el
            resumen.
          </p>
        )}

        {!loading && resultado && (
          <ul className="cc-sidebar__list">
            {resultado.resumen.map((item) => (
              <li key={item.label}>
                <span>{item.label}</span>
                <strong>
                  {item.cantidad} {item.unidad}
                </strong>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="cc-sidebar__tip">
        <span aria-hidden="true">💡</span>
        <div>
          <p className="cc-sidebar__tip-title">Consejo</p>
          <p>
            {resultado?.consejo ??
              "Si sobra comida, calculamos un margen extra del 10% para que falte lo justo 🙂"}
          </p>
        </div>
      </div>
    </aside>
  );
}
