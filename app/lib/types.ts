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
  Partial<Pick<Negocio, "badge" | "lat" | "lng" | "whatsapp" | "auspiciado">>;