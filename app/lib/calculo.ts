import type { CalculoRequest, CalculoResponse, CalculoResumenItem } from "./types";

const FACTOR_NINO = 0.6;
const PORCIONES_POR_PIZZA = 8;
const PORCIONES_PIZZA_POR_PERSONA = 3;

interface ReglaMenu {
  porPersona: number;
  unidad: string;
  label: string;
}

const REGLAS_MENU: Record<string, ReglaMenu> = {
  asado: { porPersona: 0.4, unidad: "kg", label: "Asado" },
  "pollo-horno": { porPersona: 0.3, unidad: "kg", label: "Pollo al horno" },
  hamburguesas: { porPersona: 1.5, unidad: "unidades", label: "Hamburguesas" },
  pastas: { porPersona: 0.15, unidad: "kg", label: "Pastas" },
  empanadas: { porPersona: 4, unidad: "unidades", label: "Empanadas" },
  choripan: { porPersona: 1, unidad: "unidades", label: "Choripán" },
  milanesas: { porPersona: 1.5, unidad: "unidades", label: "Milanesas" },
  ensaladas: { porPersona: 0.1, unidad: "kg", label: "Ensaladas" },
  postres: { porPersona: 1, unidad: "porciones", label: "Postres" },
};

// Bebidas: ajustá los ids acá cuando tengas el catálogo definitivo (bebidaData.ts)
const LITROS_POR_PERSONA = 1.2;

function personasEquivalentes(adultos: number, ninos: number): number {
  return adultos + ninos * FACTOR_NINO;
}

function redondearDecimal(valor: number): number {
  return Math.ceil(valor * 10) / 10;
}

function calcularItemMenu(id: string, personasEq: number): CalculoResumenItem | null {
  if (id === "pizza") {
    const porcionesTotales = personasEq * PORCIONES_PIZZA_POR_PERSONA;
    const pizzas = Math.ceil(porcionesTotales / PORCIONES_POR_PIZZA);

    return {
      label: "Pizza",
      cantidad: pizzas,
      unidad: pizzas === 1 ? "pizza" : "pizzas",
    };
  }

  const regla = REGLAS_MENU[id];

  if (!regla) return null;

  return {
    label: regla.label,
    cantidad: redondearDecimal(personasEq * regla.porPersona),
    unidad: regla.unidad,
  };
}

function calcularItemBebida(id: string, personasEq: number): CalculoResumenItem {
  const litros = redondearDecimal(personasEq * LITROS_POR_PERSONA);

  return { label: id, cantidad: litros, unidad: "litros" };
}

export function calcularCompra(payload: CalculoRequest): CalculoResponse {
  const { personas, adultos, ninos, menu, bebidas } = payload;
  const personasEq = personasEquivalentes(adultos, ninos);

  const resumenMenu = menu
    .map((id) => calcularItemMenu(id, personasEq))
    .filter((item): item is CalculoResumenItem => item !== null);

  const resumenBebidas = bebidas.map((id) => calcularItemBebida(id, personasEq));

  return {
    personas,
    resumen: [...resumenMenu, ...resumenBebidas],
    consejo: menu.includes("pizza")
      ? "La pizza la calculamos en pizzas enteras, no en porciones sueltas."
      : undefined,
    // Eco de lo elegido: ResultModal lo usa para filtrar negocios sugeridos por categoría.
    menu,
    bebidas,
  };
}