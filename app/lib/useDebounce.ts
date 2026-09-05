// lib/useDebounce.ts
import { useEffect, useState } from "react";

/** Devuelve `valor`, pero actualizado recién `delayMs` después del último cambio. */
export function useDebounce<T>(valor: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(valor);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(valor), delayMs);
    return () => clearTimeout(id);
  }, [valor, delayMs]);

  return debounced;
}
