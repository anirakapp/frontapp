import type { ReactElement } from "react";
import Image from "next/image";
import type { Negocio } from "../lib/types";

interface BusinessCardProps {
  negocio: Negocio;
}

export default function BusinessCard({ negocio }: BusinessCardProps): ReactElement {
  return (
    <article className="cc-business">
      <div className="cc-business__image">
        {negocio.auspiciado && (
          <span className="cc-business__sponsor">Auspiciado</span>
        )}
        <button type="button" className="cc-business__fav" aria-label="Guardar en favoritos">
          ♡
        </button>
        <Image
          src={negocio.imagen}
          alt={negocio.nombre}
          fill
          sizes="260px"
          style={{ objectFit: "cover" }}
        />
      </div>

      <div className="cc-business__body">
        <h3>{negocio.nombre}</h3>
        <p className="cc-business__meta">
          <span>⭐ {negocio.rating.toFixed(1)}</span>
          <span>({negocio.reviews})</span>
          <span>📍 {negocio.distanciaKm} km</span>
        </p>
        {negocio.badge && <p className="cc-business__badge">{negocio.badge}</p>}
      </div>
    </article>
  );
}
