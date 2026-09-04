// lib/categoriasNegocio.ts

const CATEGORIAS_POR_MENU: Record<string, string[]> = {
  asado: ["carnicería", "panadería"],
  "pollo-horno": ["carnicería", "avícola"],
  hamburguesas: ["carnicería", "panadería"],
  pastas: ["almacén"],
  pizza: ["pizzería"],
  empanadas: ["rotisería", "panadería"],
  choripan: ["carnicería", "panadería"],
  milanesas: ["carnicería"],
  ensaladas: ["verdulería"],
  postres: ["panadería", "repostería"],
};

const CATEGORIAS_POR_BEBIDA: Record<string, string[]> = {
  gaseosa: ["bebidas"],
  agua: ["bebidas"],
  jugo: ["bebidas"],
  vino: ["bebidas", "vinoteca"],
  cerveza: ["bebidas", "vinoteca"],
};

/** Categorías de negocio relevantes según lo que el usuario eligió. */
export function categoriasRelevantes(menu: string[], bebidas: string[]): Set<string> {
  const set = new Set<string>();

  menu.forEach((id) => (CATEGORIAS_POR_MENU[id] || []).forEach((c) => set.add(c)));
  bebidas.forEach((id) => (CATEGORIAS_POR_BEBIDA[id] || []).forEach((c) => set.add(c)));

  // Si pidió cualquier bebida, siempre calculamos hielo → sumamos esa categoría.
  if (bebidas.length > 0) set.add("hielo");

  return set;
}