// components/OptionGrid.tsx
import type { ReactElement } from "react";
import Image from "next/image";

export interface GridOption {
  id: string;
  label: string;
  image: string;
}

interface OptionGridProps {
  options: GridOption[];
  visibleCount: number;
  selected: string[];
  expanded: boolean;
  onToggle: (id: string) => void;
  onToggleExpanded: () => void;
  moreLabel?: string;
}

export default function OptionGrid({
  options,
  visibleCount,
  selected,
  expanded,
  onToggle,
  onToggleExpanded,
  moreLabel = "Más",
}: OptionGridProps): ReactElement {
  const hasHidden = options.length > visibleCount;
  const visibleOptions = expanded ? options : options.slice(0, visibleCount);

  return (
    <div className="cc-option-grid">
      {visibleOptions.map((option) => {
        const isSelected = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            className={[
              "cc-option-card",
              isSelected ? "cc-option-card--selected" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-pressed={isSelected}
            onClick={() => onToggle(option.id)}
          >
            {isSelected && (
              <span className="cc-option-card__check" aria-hidden="true">
                ✓
              </span>
            )}
            <span className="cc-option-card__label">{option.label}</span>
            <span className="cc-option-card__image">
              <Image
                src={option.image}
                alt={option.label}
                fill
                sizes="120px"
                style={{ objectFit: "contain" }}
              />
            </span>
          </button>
        );
      })}

      {hasHidden && (
        <button
          type="button"
          className="cc-option-card cc-option-card--more"
          onClick={onToggleExpanded}
        >
          <span className="cc-option-card__label">{moreLabel}</span>
          <span aria-hidden="true">{expanded ? "︿" : "﹀"}</span>
        </button>
      )}
    </div>
  );
}