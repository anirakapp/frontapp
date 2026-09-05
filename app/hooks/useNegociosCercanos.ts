"use client";

import { useEffect, useRef, useState } from "react";
import type { Negocio } from "../lib/types";
import { fetchNegociosCercanos } from "../lib/api";

interface NegociosCercanosState {
  negocios: Negocio[];
  loading: boolean;
  error: string | null;
  sinUbicacion: boolean;
}

// Distancia mínima (en metros) que tenés que moverte para que
// volvamos a pedir la lista de negocios al backend.
// Por debajo de esto, solo recalculamos distanciaKm localmente.
const DISTANCIA_MINIMA_REFETCH_M = 400;

function distanciaHaversineM(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // radio de la Tierra en metros
  const rad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

function recalcularDistancias(
  negocios: Negocio[],
  lat: number,
  lon: number
): Negocio[] {
  return negocios
    .filter((n): n is Negocio & { lat: number; lng: number } => n.lat != null && n.lng != null)
    .map((n) => ({
      ...n,
      distanciaKm: distanciaHaversineM(lat, lon, n.lat, n.lng) / 1000,
    }));
}

export function useNegociosCercanos(): NegociosCercanosState {
  const [state, setState] = useState<NegociosCercanosState>({
    negocios: [],
    loading: true,
    error: null,
    sinUbicacion: false,
  });

  // Guardamos la última posición desde la que pedimos negocios al backend,
  // para decidir si hace falta un refetch o alcanza con recalcular distancia.
  const ultimaPosicionFetch = useRef<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ negocios: [], loading: false, error: null, sinUbicacion: true });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        const previa = ultimaPosicionFetch.current;

        const moviste = previa
          ? distanciaHaversineM(previa.lat, previa.lon, latitude, longitude)
          : Infinity; // primera lectura: siempre buscamos

        if (moviste < DISTANCIA_MINIMA_REFETCH_M) {
          // Te moviste poco: solo recalculamos distancia sobre lo que ya tenemos.
          setState((prev) => ({
            ...prev,
            negocios: recalcularDistancias(prev.negocios, latitude, longitude),
          }));
          return;
        }

        // Te moviste bastante (o es la primera vez): volvemos a pedir negocios.
        ultimaPosicionFetch.current = { lat: latitude, lon: longitude };

        setState((prev) => ({ ...prev, loading: prev.negocios.length === 0 }));

        void fetchNegociosCercanos(latitude, longitude)
          .then((negocios) =>
            setState({
              negocios: recalcularDistancias(negocios, latitude, longitude),
              loading: false,
              error: null,
              sinUbicacion: false,
            })
          )
          .catch(() =>
            setState((prev) => ({
              ...prev,
              loading: false,
              error: "No se pudieron cargar los negocios cercanos.",
            }))
          );
      },
      () => setState({ negocios: [], loading: false, error: null, sinUbicacion: true }),
      { enableHighAccuracy: false, timeout: 8000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return state;
}
