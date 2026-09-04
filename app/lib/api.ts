// lib/api.ts
// Única capa que conoce la URL del backend. Todo el cálculo real
// (cantidades de comida/bebida) y el listado de negocios vive en el backend
// (index.js -> routes -> controllers). Acá SOLO hacemos fetch y tipamos la respuesta.
import type {
  CalculoRequest,
  CalculoResponse,
  Negocio,
  NegocioInput,
  ApiError,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  MenuOption,
  DrinkOption,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://appback-six.vercel.app";

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `Error ${res.status} al contactar el backend`;
    try {
      const body: unknown = await res.json();
      if (
        body &&
        typeof body === "object" &&
        "message" in body &&
        typeof (body as { message?: unknown }).message === "string"
      ) {
        message = (body as { message: string }).message;
      }
    } catch {
      // sin body JSON, se usa el mensaje genérico
    }
    const error: ApiError = { message, status: res.status };
    throw error;
  }
  return (await res.json()) as T;
}

/**
 * POST /api/calculo
 * El backend recibe personas + menú + bebidas y devuelve el resumen calculado.
 */
export async function postCalculo(payload: CalculoRequest): Promise<CalculoResponse> {
  const res = await fetch(`${API_URL}/api/calculo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<CalculoResponse>(res);
}

/**
 * GET /api/negocios?ciudad=Rosario
 * Lista de negocios auspiciados/cercanos que arma el backend.
 */
export async function getNegocios(ciudad: string): Promise<Negocio[]> {
  const res = await fetch(
    `${API_URL}/api/negocios?ciudad=${encodeURIComponent(ciudad)}`,
    { cache: "no-store" }
  );
  return parseJsonOrThrow<Negocio[]>(res);
}

export function isApiError(value: unknown): value is ApiError {
  return typeof value === "object" && value !== null && "message" in value;
}

function authHeaders(token: string): HeadersInit {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

// ---------------- Auth ----------------

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<AuthResponse>(res);
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseJsonOrThrow<AuthResponse>(res);
}

// ---------------- Admin: catálogo (menú / bebidas) ----------------

export interface Catalogo {
  menu: MenuOption[];
  bebidas: DrinkOption[];
}

export async function adminGetCatalogo(token: string): Promise<Catalogo> {
  const res = await fetch(`${API_URL}/api/admin/catalogo`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  return parseJsonOrThrow<Catalogo>(res);
}

type Tipo = "menu" | "bebidas";

export async function adminAgregarItem(
  token: string,
  tipo: Tipo,
  item: MenuOption | DrinkOption
): Promise<MenuOption | DrinkOption> {
  const res = await fetch(`${API_URL}/api/admin/catalogo/${tipo}`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(item),
  });
  return parseJsonOrThrow(res);
}

export async function adminActualizarItem(
  token: string,
  tipo: Tipo,
  id: string,
  cambios: Partial<MenuOption | DrinkOption>
): Promise<MenuOption | DrinkOption> {
  const res = await fetch(`${API_URL}/api/admin/catalogo/${tipo}/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(cambios),
  });
  return parseJsonOrThrow(res);
}

export async function adminEliminarItem(
  token: string,
  tipo: Tipo,
  id: string
): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/catalogo/${tipo}/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  await parseJsonOrThrow(res);
}

// ---------------- Admin: negocios ----------------

export async function adminGetNegociosTodos(token: string): Promise<Negocio[]> {
  const res = await fetch(`${API_URL}/api/negocios/admin/todos`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  return parseJsonOrThrow<Negocio[]>(res);
}

export async function adminCrearNegocio(
  token: string,
  data: NegocioInput
): Promise<Negocio> {
  const res = await fetch(`${API_URL}/api/negocios`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return parseJsonOrThrow<Negocio>(res);
}

export async function adminActualizarNegocio(
  token: string,
  id: string,
  cambios: Partial<NegocioInput>
): Promise<Negocio> {
  const res = await fetch(`${API_URL}/api/negocios/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(cambios),
  });
  return parseJsonOrThrow<Negocio>(res);
}

export async function adminEliminarNegocio(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/negocios/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  await parseJsonOrThrow(res);
}

export async function fetchNegociosCercanos(lat: number, lng: number): Promise<Negocio[]> {
  const res = await fetch(
    `${API_URL}/api/negocios/cercanos?lat=${lat}&lng=${lng}`,
    { cache: "no-store" }
  );
  return parseJsonOrThrow<Negocio[]>(res);
}


export async function registrarNegocioPropio(
  token: string,
  data: NegocioInput
): Promise<Negocio> {
  const res = await fetch(`${API_URL}/api/negocios/registro`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  return parseJsonOrThrow<Negocio>(res);
}

/** GET /api/negocios/propios — los negocios que cargó el usuario logueado, con su estado. */
export async function getMisNegocios(token: string): Promise<Negocio[]> {
  const res = await fetch(`${API_URL}/api/negocios/propios`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  return parseJsonOrThrow<Negocio[]>(res);
}

/** GET /api/negocios/admin/pendientes — panel admin: negocios esperando aprobación. */
export async function adminGetNegociosPendientes(token: string): Promise<Negocio[]> {
  const res = await fetch(`${API_URL}/api/negocios/admin/pendientes`, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  return parseJsonOrThrow<Negocio[]>(res);
}

/** PATCH /api/negocios/:id/aprobar — admin aprueba un negocio pendiente. */
export async function adminAprobarNegocio(token: string, id: string): Promise<Negocio> {
  const res = await fetch(`${API_URL}/api/negocios/${id}/aprobar`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
  return parseJsonOrThrow<Negocio>(res);
}