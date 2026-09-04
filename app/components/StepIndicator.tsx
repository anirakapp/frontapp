import type { ReactElement } from "react";

export type StepId = "personas" | "menu" | "bebidas" | "resultado";

interface Step {
  id: StepId;
  label: string;
  numero: number;
}

const STEPS: Step[] = [
  { id: "personas", label: "Personas", numero: 1 },
  { id: "menu", label: "Menú", numero: 2 },
  { id: "bebidas", label: "Bebidas", numero: 3 },
  { id: "resultado", label: "Resultado", numero: 4 },
];

interface StepIndicatorProps {
  /** Pasos ya completados (independiente del actual). */
  completed: StepId[];
  active: StepId;
}

export default function StepIndicator({
  completed,
  active,
}: StepIndicatorProps): ReactElement {
  return (
    <ol className="cc-steps" aria-label="Progreso del cálculo">
      {STEPS.map((step, index) => {
        const isCompleted = completed.includes(step.id);
        const isActive = step.id === active;
        return (
          <li
            key={step.id}
            className={[
              "cc-steps__item",
              isActive ? "cc-steps__item--active" : "",
              isCompleted ? "cc-steps__item--done" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="cc-steps__badge">
              {isCompleted ? "✓" : step.numero}
            </span>
            <span className="cc-steps__label">{step.label}</span>
            {index < STEPS.length - 1 && (
              <span className="cc-steps__arrow" aria-hidden="true">
                →
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
