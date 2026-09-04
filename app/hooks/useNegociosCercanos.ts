"use client";

import { useEffect, useState } from "react";
import type { Negocio } from "../lib/types";
import { fetchNegociosCercanos } from "../lib/api";

interface NegociosCercanosState {
  negocios: Negocio[];
  loading: boolean;
  error: string | null;
  sinUbicacion: boolean;
}

export function useNegociosCercanos(): NegociosCercanosState {
  const [state, setState] = useState<NegociosCercanosState>({
    negocios: [],
    loading: true,
    error: null,
    sinUbicacion: false,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ negocios: [], loading: false, error: null, sinUbicacion: true });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;

        void fetchNegociosCercanos(latitude, longitude)
          .then((negocios) =>
            setState({ negocios, loading: false, error: null, sinUbicacion: false })
          )
          .catch(() =>
            setState({
              negocios: [],
              loading: false,
              error: "No se pudieron cargar los negocios cercanos.",
              sinUbicacion: false,
            })
          );
      },
      () => setState({ negocios: [], loading: false, error: null, sinUbicacion: true }),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  return state;
}