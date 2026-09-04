"use client";

import { useEffect, useState, type ReactElement } from "react";
import BusinessCard from "./BusinessCard";
import { getNegocios } from "../lib/api";
import type { Negocio } from "../lib/types";

interface BusinessesSectionProps {
  ciudad: string;
}

export default function BusinessesSection({
  ciudad,
}: BusinessesSectionProps): ReactElement {
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      setLoading(true);
      try {
        const data = await getNegocios(ciudad);
        if (!cancelled) {
          setNegocios(data);
          setUsingFallback(false);
        }
      } catch {
        // Backend todavía no disponible: se usa el fallback local de desarrollo.
        if (!cancelled) {
          setUsingFallback(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [ciudad]);

  return (
    <section className="cc-negocios" id="negocios" aria-labelledby="negocios-heading">
      <div className="cc-negocios__header">
        <h2 id="negocios-heading">¿Dónde comprar cerca?</h2>
        <a href="#negocios">Ver más comercios</a>
      </div>

      {usingFallback && (
        <p className="cc-negocios__notice">
          Mostrando datos de ejemplo: no se pudo conectar con el backend en{" "}
          {process.env.NEXT_PUBLIC_API_URL ?? "https://appback-six.vercel.app"}.
        </p>
      )}

      {loading ? (
        <p className="cc-negocios__loading">Buscando comercios cerca tuyo…</p>
      ) : (
        <div className="cc-negocios__scroller">
          {negocios.map((negocio) => (
            <BusinessCard key={negocio.id} negocio={negocio} />
          ))}
        </div>
      )}
    </section>
  );
}
