"use client";

import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { getToken, saveSession, isAdmin } from "../lib/auth";
import "../styles/panel.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://appback-six.vercel.app/api";

interface UsuarioPanel {
  id: string;
  nombre: string;
  email: string;
  role: string;
  avatarUrl: string | null;
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

export default function PanelPage(): ReactElement {
  const router = useRouter();

  const [usuario, setUsuario] = useState<UsuarioPanel | null>(null);
  const [negocios, setNegocios] = useState<NegocioPropio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [guardandoAvatar, setGuardandoAvatar] = useState(false);
  const [avatarMensaje, setAvatarMensaje] = useState<string | null>(null);

  const [negocioEnEdicion, setNegocioEnEdicion] = useState<string | null>(null);
  const [formNegocio, setFormNegocio] = useState<Partial<NegocioPropio>>({});
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
        setAvatarUrl(meData.user.avatarUrl || "");

        const negociosData = await apiFetch("/negocios/propios");
        setNegocios(negociosData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo cargar el panel");
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, [router]);

  async function handleGuardarAvatar(e: FormEvent): Promise<void> {
    e.preventDefault();
    setGuardandoAvatar(true);
    setAvatarMensaje(null);
    try {
      const data = await apiFetch("/auth/avatar", {
        method: "PATCH",
        body: JSON.stringify({ avatarUrl: avatarUrl.trim() || null }),
      });
      setUsuario(data.user);

      const token = getToken();
      if (token) saveSession(token, data.user);

      setAvatarMensaje("Avatar actualizado.");
    } catch (err) {
      setAvatarMensaje(err instanceof Error ? err.message : "No se pudo actualizar el avatar");
    } finally {
      setGuardandoAvatar(false);
    }
  }

  function empezarEdicion(negocio: NegocioPropio): void {
    setNegocioEnEdicion(negocio.id);
    setFormNegocio(negocio);
    setNegocioMensaje(null);
  }

  function cancelarEdicion(): void {
    setNegocioEnEdicion(null);
    setFormNegocio({});
  }

  function handleCampoNegocio(campo: keyof NegocioPropio, valor: string): void {
    setFormNegocio((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleGuardarNegocio(e: FormEvent, id: string): Promise<void> {
    e.preventDefault();
    setGuardandoNegocio(true);
    setNegocioMensaje(null);
    try {
      const cambios = {
        nombre: formNegocio.nombre,
        categoria: formNegocio.categoria,
        imagen: formNegocio.imagen,
        ciudad: formNegocio.ciudad,
        direccion: formNegocio.direccion,
        descripcion: formNegocio.descripcion,
        barrio: formNegocio.barrio,
        telefono: formNegocio.telefono,
        horarios: formNegocio.horarios,
        whatsapp: formNegocio.whatsapp,
      };
      const actualizado = await apiFetch(`/negocios/propios/${id}`, {
        method: "PUT",
        body: JSON.stringify(cambios),
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

  async function handleDesuscribir(id: string): Promise<void> {
    const confirmado = window.confirm(
      "¿Seguro que querés dar de baja tu negocio? Esta acción no se puede deshacer."
    );
    if (!confirmado) return;

    setDandoBaja(id);
    try {
      await apiFetch(`/negocios/propios/${id}`, { method: "DELETE" });
      setNegocios((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo dar de baja el negocio");
    } finally {
      setDandoBaja(null);
    }
  }

  if (cargando) {
    return (
      <main className="cc-panel">
        <p className="cc-panel__estado">Cargando tu panel…</p>
      </main>
    );
  }

  if (error && !usuario) {
    return (
      <main className="cc-panel">
        <p className="cc-panel__estado cc-panel__estado--error">{error}</p>
      </main>
    );
  }

  return (
    <main className="cc-panel">
      <h1 className="cc-panel__titulo">Mi panel</h1>

      <section className="cc-panel__card">
        <h2>Mi perfil</h2>
        <div className="cc-panel__perfil">
          <img
            src={avatarUrl || "/assets/avatar-default.png"}
            alt="Avatar"
            className="cc-panel__avatar"
          />
          <div className="cc-panel__perfil-datos">
            <p className="cc-panel__nombre">{usuario?.nombre}</p>
            <p className="cc-panel__email">{usuario?.email}</p>
          </div>
        </div>

        <form className="cc-panel__form" onSubmit={handleGuardarAvatar}>
          <label htmlFor="avatarUrl">URL de tu nuevo avatar</label>
          <input
            id="avatarUrl"
            type="url"
            placeholder="https://ejemplo.com/mi-foto.jpg"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
          />
          <button type="submit" className="cc-panel__boton" disabled={guardandoAvatar}>
            {guardandoAvatar ? "Guardando…" : "Guardar avatar"}
          </button>
          {avatarMensaje && <p className="cc-panel__mensaje">{avatarMensaje}</p>}
        </form>
      </section>

      <section className="cc-panel__card">
        <h2>Mi negocio</h2>

        {negocios.length === 0 && (
          <div>
            <p>Todavía no tenés un negocio registrado.</p>
            <a href="/registro" className="cc-panel__boton cc-panel__boton--cta">
              Registrar mi negocio
            </a>
          </div>
        )}

        {negocioMensaje && <p className="cc-panel__mensaje">{negocioMensaje}</p>}

        {negocios.map((negocio) => (
          <div key={negocio.id} className="cc-panel__negocio">
            {negocioEnEdicion === negocio.id ? (
              <form
                className="cc-panel__form"
                onSubmit={(e) => handleGuardarNegocio(e, negocio.id)}
              >
                <label>
                  Nombre
                  <input
                    value={formNegocio.nombre || ""}
                    onChange={(e) => handleCampoNegocio("nombre", e.target.value)}
                  />
                </label>
                <label>
                  Categoría
                  <input
                    value={formNegocio.categoria || ""}
                    onChange={(e) => handleCampoNegocio("categoria", e.target.value)}
                  />
                </label>
                <label>
                  Imagen (URL)
                  <input
                    value={formNegocio.imagen || ""}
                    onChange={(e) => handleCampoNegocio("imagen", e.target.value)}
                  />
                </label>
                <label>
                  Ciudad
                  <input
                    value={formNegocio.ciudad || ""}
                    onChange={(e) => handleCampoNegocio("ciudad", e.target.value)}
                  />
                </label>
                <label>
                  Dirección
                  <input
                    value={formNegocio.direccion || ""}
                    onChange={(e) => handleCampoNegocio("direccion", e.target.value)}
                  />
                </label>
                <label>
                  Barrio
                  <input
                    value={formNegocio.barrio || ""}
                    onChange={(e) => handleCampoNegocio("barrio", e.target.value)}
                  />
                </label>
                <label>
                  Teléfono
                  <input
                    value={formNegocio.telefono || ""}
                    onChange={(e) => handleCampoNegocio("telefono", e.target.value)}
                  />
                </label>
                <label>
                  WhatsApp
                  <input
                    value={formNegocio.whatsapp || ""}
                    onChange={(e) => handleCampoNegocio("whatsapp", e.target.value)}
                  />
                </label>
                <label>
                  Horarios
                  <input
                    value={formNegocio.horarios || ""}
                    onChange={(e) => handleCampoNegocio("horarios", e.target.value)}
                  />
                </label>
                <label>
                  Descripción
                  <textarea
                    value={formNegocio.descripcion || ""}
                    onChange={(e) => handleCampoNegocio("descripcion", e.target.value)}
                  />
                </label>

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
  );
}
