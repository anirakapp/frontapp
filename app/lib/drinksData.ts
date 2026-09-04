// lib/drinksData.ts
// Catálogo de bebidas. La selección de bebidas es OBLIGATORIA (mínimo 1).
import type { DrinkOption } from "./types";

export const DRINK_OPTIONS: DrinkOption[] = [
  { id: "gaseosa", label: "Gaseosa", image: "/assets/bebidas/gaseosa.jpg" },
  { id: "agua", label: "Agua", image: "/assets/bebidas/agua.jpg" },
  { id: "jugo", label: "Jugo", image: "/assets/bebidas/jugo.jpg" },
  { id: "vino", label: "Vino", image: "/assets/bebidas/vino.jpg" },
  { id: "cerveza", label: "Cerveza", image: "/assets/bebidas/cerveza.jpg" },
];

export const DRINK_VISIBLE_COUNT = 4;

/** Preselección por defecto, igual al diseño (Gaseosa + Agua tildadas). */
export const DEFAULT_DRINKS: string[] = ["gaseosa", "agua"];
