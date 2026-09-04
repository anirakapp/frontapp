// components/MenuSelector.tsx
import { useState, type ReactElement } from "react";
import Swal from "sweetalert2";
import OptionGrid from "./OptionGrid";
import { MENU_OPTIONS, MENU_VISIBLE_COUNT } from "../lib/menuData";
import "../styles/food.css";

interface MenuSelectorProps {
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function MenuSelector({
  selected,
  onChange,
}: MenuSelectorProps): ReactElement {
  const [expanded, setExpanded] = useState(false);

  function toggle(id: string): void {
    const next = selected.includes(id)
      ? selected.filter((item) => item !== id)
      : [...selected, id];

    const labels = next
      .map((selectedId) => MENU_OPTIONS.find((option) => option.id === selectedId)?.label)
      .filter(Boolean)
      .join(", ");

    void Swal.fire({
      icon: labels ? "success" : "info",
      title: labels ? "Seleccionaste:" : "Sin platos seleccionados",
      text: labels || "No seleccionaste ningún plato",
      timer: 1200,
      showConfirmButton: false,
      position: "top-end",
      toast: true,
    });

    onChange(next);
  }

  return (
    <section className="cc-card__section cc-food-section" aria-labelledby="menu-heading">
      <h2 id="menu-heading" className="cc-card__question">
        ¿Qué vas a preparar?
      </h2>
      <p className="cc-card__hint">Opcional: podés elegir uno o varios platos.</p>

      <OptionGrid
        options={MENU_OPTIONS}
        visibleCount={MENU_VISIBLE_COUNT}
        selected={selected}
        expanded={expanded}
        onToggle={toggle}
        onToggleExpanded={() => setExpanded((value) => !value)}
        moreLabel="Más menús"
      />
    </section>
  );
}