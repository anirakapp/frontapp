"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import type { Negocio, Sugerencia } from "../lib/types";
import { getSugerencias, searchBusinesses, isApiError } from "../lib/api";
import "../styles/searchbar.css";

interface SearchBarProps {
  ciudad: string;
  onResultados: (resultados: Negocio[], query: string) => void;
}

const DEBOUNCE_MS = 300;

export default function SearchBar({ ciudad, onResultados }: SearchBarProps): ReactElement {
  const [query, setQuery] = useState("");
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(-1);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usarUbicacion, setUsarUbicacion] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Evita pisar resultados si una sugerencia vieja responde después que una nueva.
  const requestIdRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cierra el dropdown si se hace click afuera.
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setMostrarSugerencias(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Autocompletado con debounce.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const texto = query.trim();
    if (texto.length < 2) {
      setSugerencias([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const idActual = ++requestIdRef.current;
      void getSugerencias(texto)
        .then((data) => {
          if (idActual === requestIdRef.current) {
            setSugerencias(data);
            setIndiceActivo(-1);
          }
        })
        .catch(() => {
          // El autocompletado es un extra: si falla, no rompemos la búsqueda.
          if (idActual === requestIdRef.current) setSugerencias([]);
        });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  function pedirUbicacion(): void {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setUsarUbicacion(true);
      },
      () => setUsarUbicacion(false),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }

  const ejecutarBusqueda = useCallback(
    async (texto: string) => {
      const limpio = texto.trim();
      if (!limpio) {
        onResultados([], "");
        return;
      }

      setBuscando(true);
      setError(null);
      setMostrarSugerencias(false);

      try {
        const data = await searchBusinesses(limpio, {
          ciudad,
          lat: usarUbicacion ? coords?.lat : undefined,
          lng: usarUbicacion ? coords?.lng : undefined,
        });
        onResultados(data.resultados, data.query);
      } catch (err) {
        setError(isApiError(err) ? err.message : "No pudimos buscar. Probá de nuevo.");
        onResultados([], limpio);
      } finally {
        setBuscando(false);
      }
    },
    [ciudad, usarUbicacion, coords, onResultados]
  );

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    void ejecutarBusqueda(query);
  }

  function seleccionarSugerencia(sugerencia: Sugerencia): void {
    setQuery(sugerencia.texto);
    setSugerencias([]);
    void ejecutarBusqueda(sugerencia.texto);
  }

  function limpiar(): void {
    setQuery("");
    setSugerencias([]);
    setError(null);
    setMostrarSugerencias(false);
    onResultados([], "");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    if (!mostrarSugerencias || sugerencias.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndiceActivo((prev) => (prev + 1) % sugerencias.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndiceActivo((prev) => (prev <= 0 ? sugerencias.length - 1 : prev - 1));
    } else if (event.key === "Enter" && indiceActivo >= 0) {
      event.preventDefault();
      seleccionarSugerencia(sugerencias[indiceActivo]);
    } else if (event.key === "Escape") {
      setMostrarSugerencias(false);
    }
  }

  return (
    <div className="cc-searchbar" ref={containerRef}>
      <form className="cc-searchbar__form" onSubmit={handleSubmit} role="search">
        <span className="cc-searchbar__icon" aria-hidden="true">
          🔍
        </span>

        <input
          type="text"
          className="cc-searchbar__input"
          placeholder="Buscar productos, negocios o categorías…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setMostrarSugerencias(true);
          }}
          onFocus={() => setMostrarSugerencias(true)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={mostrarSugerencias && sugerencias.length > 0}
          aria-controls="cc-searchbar-listbox"
          aria-activedescendant={indiceActivo >= 0 ? `cc-sugerencia-${indiceActivo}` : undefined}
          autoComplete="off"
        />

        {query && (
          <button
            type="button"
            className="cc-searchbar__clear"
            onClick={limpiar}
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}

        <button
          type="button"
          className={
            usarUbicacion
              ? "cc-searchbar__location cc-searchbar__location--activa"
              : "cc-searchbar__location"
          }
          onClick={pedirUbicacion}
          aria-pressed={usarUbicacion}
          title="Priorizar resultados cerca mío"
        >
          📍
        </button>

        <button type="submit" className="cc-searchbar__submit" disabled={buscando}>
          {buscando ? "Buscando…" : "Buscar"}
        </button>
      </form>

      {mostrarSugerencias && sugerencias.length > 0 && (
        <ul className="cc-searchbar__sugerencias" id="cc-searchbar-listbox" role="listbox">
          {sugerencias.map((sugerencia, index) => (
            <li
              key={`${sugerencia.texto}-${index}`}
              id={`cc-sugerencia-${index}`}
              role="option"
              aria-selected={index === indiceActivo}
              className={
                index === indiceActivo
                  ? "cc-searchbar__sugerencia cc-searchbar__sugerencia--activa"
                  : "cc-searchbar__sugerencia"
              }
              onMouseEnter={() => setIndiceActivo(index)}
              onMouseDown={(e) => {
                // onMouseDown (no click) para que dispare antes del blur del input.
                e.preventDefault();
                seleccionarSugerencia(sugerencia);
              }}
            >
              <span>{sugerencia.texto}</span>
              <span className="cc-searchbar__sugerencia-categoria">{sugerencia.categoria}</span>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="cc-searchbar__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
