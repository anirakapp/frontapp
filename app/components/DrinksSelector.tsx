// components/DrinksSelector.tsx
import { useState, type ReactElement } from "react";
import Swal from "sweetalert2";
import OptionGrid from "./OptionGrid";
import { DRINK_OPTIONS, DRINK_VISIBLE_COUNT } from "../lib/drinksData";
import "../styles/drink.css";

interface DrinksSelectorProps {
  selected: string[];
  onChange: (next: string[]) => void;
  showRequiredError: boolean;
}

export default function DrinksSelector({
  selected,
  onChange,
  showRequiredError,
}: DrinksSelectorProps): ReactElement {
  const [expanded, setExpanded] = useState(false);

  function toggle(id: string): void {
    const next = selected.includes(id)
      ? selected.filter((item) => item !== id)
      : [...selected, id];

    const labels = next
      .map((selectedId) => DRINK_OPTIONS.find((option) => option.id === selectedId)?.label)
      .filter(Boolean)
      .join(", ");

    void Swal.fire({
      icon: labels ? "success" : "info",
      title: labels ? "Seleccionaste:" : "Sin bebidas seleccionadas",
      text: labels || "No seleccionaste ninguna bebida",
      timer: 1200,
      showConfirmButton: false,
      position: "top-end",
      toast: true,
    });

    onChange(next);
  }

  return (
    <section className="cc-card__section cc-drink-section" aria-labelledby="bebidas-heading">
      <h2 id="bebidas-heading" className="cc-card__question">
        ¿Qué bebidas vas a servir?
      </h2>
      <p className="cc-card__hint">Obligatorio: elegí al menos una bebida.</p>

      <OptionGrid
        options={DRINK_OPTIONS}
        visibleCount={DRINK_VISIBLE_COUNT}
        selected={selected}
        expanded={expanded}
        onToggle={toggle}
        onToggleExpanded={() => setExpanded((value) => !value)}
      />

      {showRequiredError && (
        <p className="cc-error" role="alert">
          Elegí al menos una bebida para poder calcular tu compra.
        </p>
      )}
    </section>
  );
}