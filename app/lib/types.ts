// lib/types.ts
export interface MenuOption {
  id: string;
  label: string;
  image: string;
}

export interface DrinkOption {
  id: string;
  label: string;
  image: string;
}

export interface PersonasInput {
  adultos: number;
  ninos: number;
}

export interface CalculoRequest {
  personas: number;
  adultos: number;
  ninos: number;
  menu: string[];
  bebidas: string[];
}

export interface CalculoResumenItem {
  label: string;
  cantidad: number;
  unidad: string;
}

// Consolidé las dos declaraciones que tenías en un solo interface.
export interface CalculoResponse {
  personas: number;
  resumen: CalculoResumenItem[];
  consejo?: string;
  /** Eco de lo elegido, para poder filtrar negocios sugeridos por categoría. */
  menu: string[];
  bebidas: string[];
}

export interface Negocio {
  id: string;
  nombre: string;
  categoria: string;
  imagen: string;
  rating: number;
  reviews: number;
  distanciaKm: number;
  lat: number | null;
  lng: number | null;
  badge?: string;
  auspiciado: boolean;
  ciudad: string;
  /** Dirección en texto libre, para mostrar en el modal de resultado y en el admin. */
  direccion?: string;
  habilitado: boolean;
  whatsapp?: string;
  ownerId: string | null;

  // --- NUEVO: buscador inteligente / likes / reputación / moderación ---
  descripcion?: string;
  barrio?: string;
  telefono?: string;
  horarios?: string;
  /** Palabras clave propias del negocio (además de las que ya vienen del diccionario del buscador). */
  palabrasClave?: string[];
  /** Si el negocio está activo (lo puede apagar el dueño o el admin). No confundir con "habilitado" (aprobación). */
  activo?: boolean;
  /** Si el admin lo bloqueó. Un negocio bloqueado no aparece en público ni en el buscador, pero no se borra. */
  isBlocked?: boolean;
  /** Cantidad total de likes (desnormalizado en el backend). */
  likes?: number;
  /** Si el usuario logueado actual ya le dio like (solo viene si mandaste el token). */
  likeadoPorMi?: boolean;
  /** Cantidad de productos cargados (solo lo devuelve el panel admin). */
  cantidadProductos?: number;
}

export interface ApiError {
  message: string;
  status?: number;
}

export type UserRole = "admin" | "user";

export interface AuthUser {
  id: string;
  nombre: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  nombre: string;
  email: string;
  password: string;
}

// "direccion" queda obligatoria acá (aunque en Negocio es opcional, por los
// negocios viejos que no la tenían cargada) porque todo negocio nuevo,
// cargado desde el registro público o desde el admin, tiene que traerla:
// sin dirección/lat/lng no puede aparecer en el listado de "cercanos".
export type NegocioInput = Pick<Negocio, "nombre" | "categoria" | "imagen" | "ciudad"> &
  Required<Pick<Negocio, "direccion">> &
  Partial<
    Pick<
      Negocio,
      | "badge"
      | "lat"
      | "lng"
      | "whatsapp"
      | "auspiciado"
      | "descripcion"
      | "barrio"
      | "telefono"
      | "horarios"
      | "palabrasClave"
    >
  >;

// --- NUEVO: tipos del buscador inteligente ---

export interface Sugerencia {
  texto: string;
  categoria: string;
}

export interface SearchResponse {
  query: string;
  resultados: Negocio[];
  sugerenciaVacia: boolean;
}

export interface RatingResponse {
  rating: number;
  reviews: number;
}
