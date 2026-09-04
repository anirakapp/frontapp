import type { ReactElement } from "react";

interface PeopleFormProps {
  adultos: number;
  ninos: number;
  onChangeAdultos: (value: number) => void;
  onChangeNinos: (value: number) => void;
}

const MIN_PERSONAS = 1;
const MAX_PERSONAS = 500;

export default function PeopleForm({
  adultos,
  ninos,
  onChangeAdultos,
  onChangeNinos,
}: PeopleFormProps): ReactElement {
  const total = adultos + ninos;

  function clamp(value: number): number {
    if (Number.isNaN(value)) return MIN_PERSONAS;
    return Math.min(MAX_PERSONAS, Math.max(0, value));
  }

  function handleTotalStep(delta: number): void {
    const nextTotal = clamp(total + delta);
    // Al mover el total con +/-, el ajuste recae sobre "adultos".
    const nextAdultos = clamp(nextTotal - ninos);
    onChangeAdultos(nextAdultos);
  }

  return (
    <section className="cc-card__section" aria-labelledby="personas-heading">
      <h2 id="personas-heading" className="cc-card__question">
        ¿Cuántas personas?
      </h2>

      <div className="cc-personas">
        <div className="cc-personas__total">
          <button
            type="button"
            className="cc-round-btn"
            onClick={() => handleTotalStep(-1)}
            aria-label="Restar una persona"
          >
            −
          </button>
          <input
            type="number"
            className="cc-personas__input"
            value={total}
            min={MIN_PERSONAS}
            max={MAX_PERSONAS}
            onChange={(event) => {
              const nextTotal = clamp(Number(event.target.value));
              onChangeAdultos(clamp(nextTotal - ninos));
            }}
            aria-label="Cantidad total de personas"
          />
          <button
            type="button"
            className="cc-round-btn"
            onClick={() => handleTotalStep(1)}
            aria-label="Sumar una persona"
          >
            +
          </button>
        </div>

        <div className="cc-personas__breakdown">
          <label className="cc-personas__field">
            <span>Adultos</span>
            <input
              type="number"
              min={0}
              max={MAX_PERSONAS}
              value={adultos}
              onChange={(event) => onChangeAdultos(clamp(Number(event.target.value)))}
            />
          </label>

          <label className="cc-personas__field">
            <span>Niños</span>
            <input
              type="number"
              min={0}
              max={MAX_PERSONAS}
              value={ninos}
              onChange={(event) => onChangeNinos(clamp(Number(event.target.value)))}
            />
          </label>

          <span
            className="cc-personas__info"
            title="Los niños se calculan con una porción menor a la de un adulto"
            aria-hidden="true"
          >
            ⓘ
          </span>
        </div>
      </div>
    </section>
  );
}
