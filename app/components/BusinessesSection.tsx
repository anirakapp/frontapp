"use client";

import type { ReactElement } from "react";
import BusinessCard from "./BusinessCard";
import { useNegociosCercanos } from "../hooks/useNegociosCercanos";

export default function BusinessesSection(): ReactElement {
  const { negocios, loading, error, sinUbicacion } = useNegociosCercanos();
  const habilitados = negocios.filter((n) => n.habilitado);

  return (
    <section className="cc-negocios" id="negocios" aria-labelledby="negocios-heading">
      <div className="cc-negocios__header">
        <h2 id="negocios-heading">¿Dónde comprar cerca?</h2>
        <a href="#negocios">Ver más comercios</a>
      </div>

      {loading && <p className="cc-negocios__loading">Buscando comercios cerca tuyo…</p>}

      {!loading && sinUbicacion && (
        <p className="cc-negocios__notice">Activá tu ubicación para ver comercios cerca tuyo.</p>
      )}

      {!loading && error && <p className="cc-error">{error}</p>}

      {!loading && !sinUbicacion && !error && (
        <div className="cc-negocios__scroller">
          {habilitados.map((negocio) => (
            <BusinessCard key={negocio.id} negocio={negocio} />
          ))}
        </div>
      )}
    </section>
  );
}
