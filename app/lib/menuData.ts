// lib/menuData.ts
// Catálogo de menús. Agregar un nuevo plato = agregar un objeto acá
// (y su imagen en public/assets/menu/<id>.jpg). No requiere tocar componentes.
import type { MenuOption } from "./types";

export const MENU_OPTIONS: MenuOption[] = [
  { id: "asado", label: "Asado", image: "/assets/menu/asado.jpg" },
  { id: "pollo-horno", label: "Pollo al horno", image: "/assets/menu/pollo-horno.jpg" },
  { id: "hamburguesas", label: "Hamburguesas", image: "/assets/menu/hamburguesas.jpg" },
  { id: "pastas", label: "Pastas", image: "/assets/menu/pastas.jpg" },
  { id: "pizza", label: "Pizza", image: "/assets/menu/pizza.jpg" },
  { id: "empanadas", label: "Empanadas", image: "/assets/menu/empanadas.jpg" },
  { id: "choripan", label: "Choripán", image: "/assets/menu/choripan.jpg" },
  { id: "milanesas", label: "Milanesas", image: "/assets/menu/milanesas.jpg" },
  { id: "ensaladas", label: "Ensaladas", image: "/assets/menu/ensaladas.jpg" },
  { id: "postres", label: "Postres", image: "/assets/menu/postres.jpg" },
];

/** Cuántas opciones se muestran "arriba del pliegue" antes de "Más menús". */
export const MENU_VISIBLE_COUNT = 4;
