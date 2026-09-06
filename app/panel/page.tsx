"use client";

import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { getToken, saveSession, isAdmin } from "../lib/auth";
import Header from "../components/Header";
import type { Negocio } from "../lib/types";
import "../styles/panel.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://appback-six.vercel.app/api";

interface UsuarioPanel {
  id: string;
  nombre: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  telefono: string | null;
}

interface NegocioPropio {
  id: string;
  nombre: string;
  categoria: string;
  imagen: string;
  ciudad: string;
  direccion?: string;
  descripcion?: string;
  barrio?: string;
  telefono?: string;
  horarios?: string;
  whatsapp?: string;
  lat?: number | null;
  lng?: number | null;
  habilitado: boolean;
  activo: boolean;
  isBlocked: boolean;
}

type NegocioFormData = Partial<
  Pick<
    NegocioPropio,
    | "nombre"
    | "categoria"
    | "imagen"
    | "ciudad"
    | "direccion"
    | "descripcion"
    | "barrio"
    | "telefono"
    | "horarios"
    | "whatsapp"
  >
>;

interface PerfilFormData {
  nombre: string;
  telefono: string;
  avatarUrl: string;
}

const NEGOCIO_FORM_VACIO: NegocioFormData = {
  nombre: "",
  categoria: "",
  imagen: "",
  ciudad: "",
  direccion: "",
  descripcion: "",
  barrio: "",
  telefono: "",
  horarios: "",
  whatsapp: "",
};

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && data.message) || "Ocurrió un error");
  }
  return data;
}

function CamposNegocio({
  valores,
  onCambiar,
}: {
  valores: NegocioFormData;
  onCambiar: (campo: keyof NegocioFormData, valor: string) => void;
}): ReactElement {
  return (
    <>
      <label>
        Nombre
        <input
          value={valores.nombre || ""}
          onChange={(e) => onCambiar("nombre", e.target.value)}
          required
        />
      </label>
      <label>
        Categoría
        <input
          value={valores.categoria || ""}
          onChange={(e) => onCambiar("categoria", e.target.value)}
          required
        />
      </label>
      <label>
        Imagen (URL)
        <input
          value={valores.imagen || ""}
          onChange={(e) => onCambiar("imagen", e.target.value)}
          required
        />
      </label>
      <label>
        Ciudad
        <input
          value={valores.ciudad || ""}
          onChange={(e) => onCambiar("ciudad", e.target.value)}
          required
        />
      </label>
      <label>
        Dirección
        <input
          value={valores.direccion || ""}
          onChange={(e) => onCambiar("direccion", e.target.value)}
        />
      </label>
      <label>
        Barrio
        <input
          value={valores.barrio || ""}
          onChange={(e) => onCambiar("barrio", e.target.value)}
        />
      </label>
      <label>
        Teléfono
        <input
          value={valores.telefono || ""}
          onChange={(e) => onCambiar("telefono", e.target.value)}
        />
      </label>
      <label>
        WhatsApp
        <input
          value={valores.whatsapp || ""}
          onChange={(e) => onCambiar("whatsapp", e.target.value)}
        />
      </label>
      <label>
        Horarios
        <input
          value={valores.horarios || ""}
          onChange={(e) => onCambiar("horarios", e.target.value)}
        />
      </label>
      <label>
        Descripción
        <textarea
          value={valores.descripcion || ""}
          onChange={(e) => onCambiar("descripcion", e.target.value)}
        />
      </label>
    </>
  );
}

export default function PanelPage(): ReactElement {
  const router = useRouter();

  const [usuario, setUsuario] = useState<UsuarioPanel | null>(null);
  const [negocios, setNegocios] = useState<NegocioPropio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Perfil: nombre + teléfono + avatar, todo en un solo form ---------
  const [formPerfil, setFormPerfil] = useState<PerfilFormData>({
    nombre: "",
    telefono: "",
    avatarUrl: "",
  });
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [perfilMensaje, setPerfilMensaje] = useState<string | null>(null);

  // --- Edición de negocio propio -----------------------------------------
  const [negocioEnEdicion, setNegocioEnEdicion] = useState<string | null>(null);
  const [formNegocio, setFormNegocio] = useState<NegocioFormData>(NEGOCIO_FORM_VACIO);
  const [guardandoNegocio, setGuardandoNegocio] = useState(false);
  const [negocioMensaje, setNegocioMensaje] = useState<string | null>(null);

  const [dandoBaja, setDandoBaja] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    if (isAdmin()) {
      router.push("/admin");
      return;
    }

    async function cargar() {
      try {
        const meData = await apiFetch("/auth/me");
        setUsuario(meData.user);
        setFormPerfil({
          nombre: meData.user.nombre || "",
          telefono: meData.user.telefono || "",
          avatarUrl: meData.user.avatarUrl || "",
        });

        const negociosData: NegocioPropio[] = await apiFetch("/negocios/propios");
        setNegocios(negociosData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar el panel");
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, [router]);

  // --- Guardar perfil (nombre + teléfono + avatar) -----------------------

  async function handleGuardarPerfil(e: FormEvent): Promise<void> {
    e.preventDefault();

    if (!formPerfil.nombre.trim()) {
      setPerfilMensaje("El nombre no puede estar vacío.");
      return;
    }
    if (formPerfil.avatarUrl && !/^https?:\/\/.+/i.test(formPerfil.avatarUrl)) {
      setPerfilMensaje("La URL del avatar no es válida.");
      return;
    }

    setGuardandoPerfil(true);
    setPerfilMensaje(null);
    try {
      const data = await apiFetch("/auth/me", {
        method: "PATCH",
        body: JSON.stringify({
          nombre: formPerfil.nombre.trim(),
          telefono: formPerfil.telefono.trim() || null,
          avatarUrl: formPerfil.avatarUrl.trim() || null,
        }),
      });
      setUsuario(data.user);

      const token = getToken();
      if (token) saveSession(token, data.user);

      setPerfilMensaje("Perfil actualizado.");
    } catch (err) {
      setPerfilMensaje(err instanceof Error ? err.message : "No se pudo actualizar el perfil");
    } finally {
      setGuardandoPerfil(false);
    }
  }

  // --- Ir a registrar negocio (cuando el usuario todavía no tiene uno) ---
  // Ya no hay formulario de alta inline en el panel: se reusa la página
  // /registro (RegisterPage.tsx), que ya tiene todo el flujo de registro
  // de negocio con el select de categorías, ubicación, etc.
  function irARegistrarNegocio(): void {
    router.push("/registro");
  }

  // --- Editar negocio propio --------------------------------------------

  function empezarEdicion(negocio: NegocioPropio): void {
    setNegocioEnEdicion(negocio.id);
    setFormNegocio({
      nombre: negocio.nombre,
      categoria: negocio.categoria,
      imagen: negocio.imagen,
      ciudad: negocio.ciudad,
      direccion: negocio.direccion,
      descripcion: negocio.descripcion,
      barrio: negocio.barrio,
      telefono: negocio.telefono,
      horarios: negocio.horarios,
      whatsapp: negocio.whatsapp,
    });
    setNegocioMensaje(null);
  }

  function cancelarEdicion(): void {
    setNegocioEnEdicion(null);
    setFormNegocio(NEGOCIO_FORM_VACIO);
  }

  async function handleGuardarNegocio(e: FormEvent, id: string): Promise<void> {
    e.preventDefault();
    setGuardandoNegocio(true);
    setNegocioMensaje(null);
    try {
      // PUT /negocios/propios/:id (negociosRoutes.js, requireAuth) ->
      // negociosController.propioActualizar, que ya valida ownerId.
      const actualizado = await apiFetch(`/negocios/propios/${id}`, {
        method: "PUT",
        body: JSON.stringify(formNegocio),
      });
      setNegocios((prev) => prev.map((n) => (n.id === id ? actualizado : n)));
      setNegocioEnEdicion(null);
      setNegocioMensaje("Negocio actualizado.");
    } catch (err) {
      setNegocioMensaje(err instanceof Error ? err.message : "No se pudo actualizar el negocio");
    } finally {
      setGuardandoNegocio(false);
    }
  }

  // --- Eliminar / desuscribirse -----------------------------------------

  async function handleDesuscribir(id: string): Promise<void> {
    const confirmado = window.confirm(
      "¿Seguro que querés dar de baja tu negocio? Esta acción no se puede deshacer."
    );
    if (!confirmado) return;

    setDandoBaja(id);
    try {
      // DELETE /negocios/propios/:id -> negociosController.propioEliminar,
      // ya valida ownerId antes de borrar.
      await apiFetch(`/negocios/propios/${id}`, { method: "DELETE" });
      setNegocios((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo dar de baja el negocio");
    } finally {
      setDandoBaja(null);
    }
  }

  // El panel no tiene su propia sección de resultados de búsqueda (eso vive
  // en HomeView). Si alguien busca desde el Header estando en /panel, lo
  // mandamos al home; ahí no tenemos forma de pasarle los resultados ya
  // calculados sin agregar estado global, así que simplemente navega y
  // el usuario puede volver a buscar en el home si hace falta.
  function handleResultadosBusqueda(_resultados: Negocio[], query: string): void {
    if (query.trim()) {
      router.push("/");
    }
  }

  if (cargando) {
    return (
      <>
        <Header ciudad="Rosario" onResultados={handleResultadosBusqueda} />
        <main className="cc-panel">
          <p className="cc-panel__estado">Cargando tu panel…</p>
        </main>
      </>
    );
  }

  if (error && !usuario) {
    return (
      <>
        <Header ciudad="Rosario" onResultados={handleResultadosBusqueda} />
        <main className="cc-panel">
          <p className="cc-panel__estado cc-panel__estado--error">{error}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header ciudad="Rosario" onResultados={handleResultadosBusqueda} />
      <main className="cc-panel">
      <h1 className="cc-panel__titulo">Mi panel</h1>

      <section className="cc-panel__card">
        <h2>Mi perfil</h2>
        <div className="cc-panel__perfil">
          <img
            src={formPerfil.avatarUrl || "/assets/avatar-default.png"}
            alt="Avatar"
            className="cc-panel__avatar"
          />
          <div className="cc-panel__perfil-datos">
            <p className="cc-panel__nombre">{usuario?.nombre}</p>
            <p className="cc-panel__email">{usuario?.email}</p>
          </div>
        </div>

        <form className="cc-panel__form" onSubmit={handleGuardarPerfil}>
          <label htmlFor="perfilNombre">Nombre</label>
          <input
            id="perfilNombre"
            type="text"
            placeholder="Tu nombre y apellido"
            value={formPerfil.nombre}
            onChange={(e) =>
              setFormPerfil((prev) => ({ ...prev, nombre: e.target.value }))
            }
            required
          />

          <label htmlFor="perfilTelefono">Teléfono</label>
          <input
            id="perfilTelefono"
            type="tel"
            placeholder="341 555-5555"
            value={formPerfil.telefono}
            onChange={(e) =>
              setFormPerfil((prev) => ({ ...prev, telefono: e.target.value }))
            }
          />

          <label htmlFor="perfilAvatar">URL de tu avatar</label>
          <input
            id="perfilAvatar"
            type="url"
            placeholder="https://ejemplo.com/mi-foto.jpg"
            value={formPerfil.avatarUrl}
            onChange={(e) =>
              setFormPerfil((prev) => ({ ...prev, avatarUrl: e.target.value }))
            }
          />

          <button type="submit" className="cc-panel__boton" disabled={guardandoPerfil}>
            {guardandoPerfil ? "Guardando…" : "Guardar cambios"}
          </button>
          {perfilMensaje && <p className="cc-panel__mensaje">{perfilMensaje}</p>}
        </form>
      </section>

      <section className="cc-panel__card">
        <div className="cc-panel__card-header">
          <h2>Mi negocio</h2>

          {/* Sin negocio: el botón lleva a /registro en vez de abrir un
              formulario inline acá. Con negocio: no hace falta este botón,
              ya se puede editar directo desde la tarjeta de abajo. */}
          {negocios.length === 0 && (
            <button type="button" className="cc-panel__boton" onClick={irARegistrarNegocio}>
              + Registrar negocio
            </button>
          )}
        </div>

        {negocioMensaje && <p className="cc-panel__mensaje">{negocioMensaje}</p>}

        {negocios.map((negocio) => (
          <div key={negocio.id} className="cc-panel__negocio">
            {negocioEnEdicion === negocio.id ? (
              <form
                className="cc-panel__form"
                onSubmit={(e) => handleGuardarNegocio(e, negocio.id)}
              >
                <CamposNegocio
                  valores={formNegocio}
                  onCambiar={(campo, valor) =>
                    setFormNegocio((prev) => ({ ...prev, [campo]: valor }))
                  }
                />
                <div className="cc-panel__acciones">
                  <button type="submit" className="cc-panel__boton" disabled={guardandoNegocio}>
                    {guardandoNegocio ? "Guardando…" : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    className="cc-panel__boton cc-panel__boton--secundario"
                    onClick={cancelarEdicion}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="cc-panel__negocio-header">
                  <img src={negocio.imagen} alt={negocio.nombre} className="cc-panel__negocio-img" />
                  <div>
                    <p className="cc-panel__negocio-nombre">{negocio.nombre}</p>
                    <p className="cc-panel__negocio-meta">
                      {negocio.categoria} · {negocio.ciudad}
                    </p>
                    <p className="cc-panel__negocio-estado">
                      {negocio.habilitado ? "Aprobado" : "Pendiente de aprobación"}
                      {negocio.isBlocked ? " · Bloqueado por el admin" : ""}
                      {!negocio.activo ? " · Inactivo" : ""}
                    </p>
                  </div>
                </div>

                <div className="cc-panel__acciones">
                  <button
                    type="button"
                    className="cc-panel__boton"
                    onClick={() => empezarEdicion(negocio)}
                  >
                    Editar datos
                  </button>
                  <button
                    type="button"
                    className="cc-panel__boton cc-panel__boton--peligro"
                    onClick={() => handleDesuscribir(negocio.id)}
                    disabled={dandoBaja === negocio.id}
                  >
                    {dandoBaja === negocio.id ? "Dando de baja…" : "Desuscribirme"}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </section>
      </main>
    </>
  );
}
