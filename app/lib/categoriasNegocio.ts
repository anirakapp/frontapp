// lib/categoriasNegocio.ts
//
// Traduce lo que el usuario eligió en el formulario (ids de MENU_OPTIONS y
// DRINK_OPTIONS, definidos en lib/menuData.ts y lib/drinksData.ts) a las
// categorías de NEGOCIO que le sirven para conseguirlo.
//
// Las categorías usadas acá deben ser EXACTAMENTE los mismos strings que
// CATEGORIAS_ESTANDAR en el backend (backend/lib/keywordDictionary.js):
// "carnicería", "almacén", "panadería", "pizzería", "bebidas", "sin tacc",
// "supermercado", "verdulería". Si el día de mañana se agrega una entrada
// nueva al DICCIONARIO del backend (ej. "rotisería"), hay que sumarla acá
// también para los items de menú que correspondan.
//

const CATEGORIAS_POR_MENU: Record<string, string[]> = {
  asado: ["carnicería", "almacén"],
  "pollo-horno": ["carnicería", "rotisería", "almacén"],
  hamburguesas: ["carnicería", "panadería", "almacén"],
  pastas: ["almacén", "supermercado"],
  pizza: ["pizzería", "almacén"],
  empanadas: ["rotisería", "almacén", "supermercado"],
  choripan: ["carnicería", "panadería"],
  milanesas: ["carnicería", "almacén"],
  ensaladas: ["verdulería"],
  postres: ["almacén", "supermercado"],
};

const CATEGORIAS_POR_BEBIDA: Record<string, string[]> = {
  gaseosa: ["bebidas", "supermercado"],
  agua: ["bebidas", "supermercado"],
  jugo: ["bebidas", "supermercado"],
  vino: ["bebidas"],
  cerveza: ["bebidas"],
};


export function categoriasRelevantes(
  menu: string[],
  bebidas: string[]
): Set<string> {
  const categorias = new Set<string>();

  menu.forEach((item) => {
    const relacionadas = CATEGORIAS_POR_MENU[item];
    if (relacionadas) relacionadas.forEach((c) => categorias.add(c.toLowerCase()));
  });

  bebidas.forEach((item) => {
    const relacionadas = CATEGORIAS_POR_BEBIDA[item];
    if (relacionadas) relacionadas.forEach((c) => categorias.add(c.toLowerCase()));
  });

  if (menu.length > 0 || bebidas.length > 0) {
    categorias.add("supermercado");
  }

  return categorias;
}
