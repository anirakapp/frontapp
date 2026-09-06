"use client";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FiChevronDown } from "react-icons/fi";
import type { Negocio, NegocioInput } from "../../lib/types";
import {
  adminGetNegociosTodos,
  adminGetNegociosPendientes,
  adminAprobarNegocio,
  adminCrearNegocio,
  adminActualizarNegocio,
  adminEliminarNegocio,
  adminBloquearNegocio,
  adminDesbloquearNegocio,
  isApiError,
} from "../../lib/api";
import { getToken, isAdmin, clearSession } from "../../lib/auth";
import "../../styles/dashboard.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://appback-six.vercel.app";

type Tab = "pendientes" | "todos";

const NEGOCIO_VACIO: NegocioInput = {
  nombre: "",
  categoria: "",
  imagen: "",
  ciudad: "",
  direccion: "",
  descripcion: "",
  barrio: "",
  telefono: "",
  horarios: "",
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("pendientes");
  const [pendientes, setPendientes] = useState<Negocio[]>([]);
  const [todos, setTodos] = useState<Negocio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<string | null>(null);
  const [nuevo, setNuevo] = useState<NegocioInput>(NEGOCIO_VACIO);
  const [palabrasClaveTexto, setPalabrasClaveTexto] = useState("");
  const [ubicando, setUbicando] = useState(false);
  const [creando, setCreando] = useState(false);

  // Modo edición. Si editandoId != null, el form edita ese negocio
  // en vez de crear uno nuevo.
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // NUEVO: categorías estándar, traídas del mismo endpoint que usa
  // RegisterPage.tsx (derivadas de CATEGORIAS_ESTANDAR en el backend).
  // Así el admin no puede tipear una categoría libre que no exista en el
  // DICCIONARIO del buscador — el select garantiza que siempre coincide.
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriasError, setCategoriasError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/categorias`)
      .then((res) => {
        if (!res.ok) throw new Error("No se pudieron cargar las categorías");
        return res.json();
      })
      .then((data) => setCategorias(data.categorias || []))
      .catch(() => setCategoriasError(true));
  }, []);

  const cargar = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push("/admin/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [pendientesData, todosData] = await Promise.all([
        adminGetNegociosPendientes(token),
        adminGetNegociosTodos(token),
      ]);
      setPendientes(pendientesData);
      setTodos(todosData);
    } catch (err) {
      if (isApiError(err) && (err.status === 401 || err.status === 403)) {
        clearSession();
        router.push("/admin/login");
        return;
      }
      setError(isApiError(err) ? err.message : "No pudimos cargar los negocios.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isAdmin()) {
      router.push("/admin/login");
      return;
    }
    void cargar();
  }, [cargar, router]);

  async function aprobar(id: string): Promise<void> {
    const token = getToken();
    if (!token) return;
    setProcesandoId(id);
    try {
      await adminAprobarNegocio(token, id);
      await cargar();
    } catch (err) {
      setError(isApiError(err) ? err.message : "No pudimos aprobar el negocio.");
    } finally {
      setProcesandoId(null);
    }
  }

  async function eliminar(id: string): Promise<void> {
    const token = getToken();
    if (!token) return;
    if (!window.confirm("¿Seguro que querés eliminar este negocio? Esta acción no se puede deshacer."))
      return;
    setProcesandoId(id);
    try {
      await adminEliminarNegocio(token, id);
      if (editandoId === id) cancelarEdicion();
      await cargar();
    } catch (err) {
      setError(isApiError(err) ? err.message : "No pudimos eliminar el negocio.");
    } finally {
      setProcesandoId(null);
    }
  }

  async function alternarBloqueo(negocio: Negocio): Promise<void> {
    const token = getToken();
    if (!token) return;
    setProcesandoId(negocio.id);
    try {
      if (negocio.isBlocked) {
        await adminDesbloquearNegocio(token, negocio.id);
      } else {
        await adminBloquearNegocio(token, negocio.id);
      }
      await cargar();
    } catch (err) {
      setError(isApiError(err) ? err.message : "No pudimos cambiar el estado del negocio.");
    } finally {
      setProcesandoId(null);
    }
  }

  function capturarUbicacion(): void {
    setError(null);

    if (!("geolocation" in navigator)) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }

    setUbicando(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNuevo((actual) => ({
          ...actual,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }));
        setUbicando(false);
      },
      () => {
        setError("No pudimos acceder a la ubicación. Revisá los permisos del navegador.");
        setUbicando(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Carga los datos de un negocio existente en el form para editarlo.
  function iniciarEdicion(negocio: Negocio): void {
    setEditandoId(negocio.id);
    setNuevo({
      nombre: negocio.nombre,
      categoria: negocio.categoria,
      imagen: negocio.imagen,
      ciudad: negocio.ciudad,
      direccion: negocio.direccion ?? "",
      descripcion: negocio.descripcion ?? "",
      barrio: negocio.barrio ?? "",
      telefono: negocio.telefono ?? "",
      horarios: negocio.horarios ?? "",
      whatsapp: negocio.whatsapp ?? "",
      badge: negocio.badge,
      auspiciado: negocio.auspiciado,
      lat: negocio.lat ?? undefined,
      lng: negocio.lng ?? undefined,
    });
    setPalabrasClaveTexto((negocio.palabrasClave ?? []).join(", "));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelarEdicion(): void {
    setEditandoId(null);
    setNuevo(NEGOCIO_VACIO);
    setPalabrasClaveTexto("");
  }

  async function guardar(event: FormEvent): Promise<void> {
    event.preventDefault();
    const token = getToken();
    if (!token) return;
    if (
      !nuevo.nombre.trim() ||
      !nuevo.categoria.trim() ||
      !nuevo.imagen.trim() ||
      !nuevo.ciudad.trim() ||
      !nuevo.direccion.trim()
    )
      return;

    setCreando(true);
    try {
      const palabrasClave = palabrasClaveTexto
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      if (editandoId) {
        await adminActualizarNegocio(token, editandoId, { ...nuevo, palabrasClave });
      } else {
        await adminCrearNegocio(token, { ...nuevo, palabrasClave });
      }

      cancelarEdicion();
      await cargar();
    } catch (err) {
      setError(
        isApiError(err)
          ? err.message
          : editandoId
          ? "No pudimos guardar los cambios del negocio."
          : "No pudimos crear el negocio."
      );
    } finally {
      setCreando(false);
    }
  }

  function handleLogout(): void {
    clearSession();
    router.push("/admin/login");
  }

  return (
    <div className="cc-dashboard">
      <header className="cc-dashboard__header">
        <h1>Negocios</h1>
        <button type="button" className="cc-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      <div className="cc-dashboard__tabs">
        <button
          type="button"
          className={tab === "pendientes" ? "cc-tab cc-tab--activo" : "cc-tab"}
          onClick={() => setTab("pendientes")}
        >
          Pendientes ({pendientes.length})
        </button>
        <button
          type="button"
          className={tab === "todos" ? "cc-tab cc-tab--activo" : "cc-tab"}
          onClick={() => setTab("todos")}
        >
          Todos ({todos.length})
        </button>
      </div>

      {error && (
        <p className="cc-error" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p>Cargando…</p>
      ) : tab === "pendientes" ? (
        <ul className="cc-dashboard__lista">
          {pendientes.length === 0 && <p>No hay negocios pendientes de aprobación.</p>}
          {pendientes.map((negocio) => (
            <li key={negocio.id} className="cc-dashboard__fila">
              <div>
                <p className="cc-dashboard__nombre">{negocio.nombre}</p>
                <p className="cc-dashboard__meta">
                  {negocio.categoria} · {negocio.ciudad}
                  {negocio.direccion ? ` · ${negocio.direccion}` : ""}
                </p>
                {negocio.lat == null || negocio.lng == null ? (
                  <p className="cc-dashboard__aviso">
                    ⚠️ Sin ubicación cargada — no va a aparecer en &ldquo;cercanos&rdquo;
                  </p>
                ) : null}
              </div>
              <div className="cc-dashboard__acciones">
                <button
                  type="button"
                  className="cc-btn cc-btn--aprobar"
                  disabled={procesandoId === negocio.id}
                  onClick={() => void aprobar(negocio.id)}
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  className="cc-btn cc-btn--eliminar"
                  disabled={procesandoId === negocio.id}
                  onClick={() => void eliminar(negocio.id)}
                >
                  Rechazar
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <form className="cc-dashboard__form" onSubmit={(e) => void guardar(e)}>
            <h2>{editandoId ? "Editar negocio" : "Nuevo negocio"}</h2>
            <input
              placeholder="Nombre"
              value={nuevo.nombre}
              onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
              required
            />

            {/* Categoría: select en vez de input libre, mismo endpoint
                /api/categorias que usa RegisterPage.tsx. Así lo que carga
                el admin siempre coincide con CATEGORIAS_ESTANDAR del
                backend, sin depender de que tipee bien. */}
            <div className={categoriasError ? "cc-select cc-select--error" : "cc-select"}>
              <select
                value={nuevo.categoria}
                onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })}
                required
                disabled={categorias.length === 0}
                className="cc-select__control"
              >
                <option value="" disabled>
                  {categoriasError
                    ? "No se pudieron cargar las categorías"
                    : categorias.length === 0
                    ? "Cargando categorías…"
                    : "Elegí una categoría…"}
                </option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <FiChevronDown className="cc-select__icon" size={18} aria-hidden="true" />
            </div>

            <input
              placeholder="Imagen (URL)"
              value={nuevo.imagen}
              onChange={(e) => setNuevo({ ...nuevo, imagen: e.target.value })}
              required
            />
            <input
              placeholder="Ciudad"
              value={nuevo.ciudad}
              onChange={(e) => setNuevo({ ...nuevo, ciudad: e.target.value })}
              required
            />
            <input
              placeholder="Dirección"
              value={nuevo.direccion}
              onChange={(e) => setNuevo({ ...nuevo, direccion: e.target.value })}
              required
            />
            <input
              placeholder="Barrio (opcional)"
              value={nuevo.barrio ?? ""}
              onChange={(e) => setNuevo({ ...nuevo, barrio: e.target.value })}
            />
            <input
              placeholder="Teléfono (opcional)"
              value={nuevo.telefono ?? ""}
              onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })}
            />
            <input
              placeholder="Horarios (opcional)"
              value={nuevo.horarios ?? ""}
              onChange={(e) => setNuevo({ ...nuevo, horarios: e.target.value })}
            />
            <input
              placeholder="Descripción (opcional)"
              value={nuevo.descripcion ?? ""}
              onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
            />
            <input
              placeholder="Palabras clave, separadas por coma (ej: aceite, aceite de girasol)"
              value={palabrasClaveTexto}
              onChange={(e) => setPalabrasClaveTexto(e.target.value)}
            />
            <input
              placeholder="WhatsApp (opcional)"
              value={nuevo.whatsapp ?? ""}
              onChange={(e) => setNuevo({ ...nuevo, whatsapp: e.target.value })}
            />
            <label className="cc-dashboard__checkbox">
              <input
                type="checkbox"
                checked={Boolean(nuevo.auspiciado)}
                onChange={(e) => setNuevo({ ...nuevo, auspiciado: e.target.checked })}
              />
              Auspiciado (aparece primero en los listados)
            </label>

            <div className="cc-dashboard__ubicacion">
              <button
                type="button"
                className="cc-btn cc-btn--ghost"
                onClick={capturarUbicacion}
                disabled={ubicando}
              >
                {ubicando ? "Ubicando…" : "📍 Usar mi ubicación actual"}
              </button>
              {nuevo.lat != null && nuevo.lng != null && (
                <span className="cc-dashboard__ubicacion-ok">✅ Ubicación capturada</span>
              )}
            </div>

            <div className="cc-dashboard__form-acciones">
              <button type="submit" disabled={creando}>
                {creando
                  ? "Guardando…"
                  : editandoId
                  ? "Guardar cambios"
                  : "Crear negocio (queda aprobado)"}
              </button>
              {editandoId && (
                <button type="button" className="cc-btn cc-btn--ghost" onClick={cancelarEdicion}>
                  Cancelar edición
                </button>
              )}
            </div>
          </form>

          <ul className="cc-dashboard__lista">
            {todos.map((negocio) => (
              <li
                key={negocio.id}
                className={
                  editandoId === negocio.id
                    ? "cc-dashboard__fila cc-dashboard__fila--editando"
                    : "cc-dashboard__fila"
                }
              >
                <div>
                  <p className="cc-dashboard__nombre">{negocio.nombre}</p>
                  <p className="cc-dashboard__meta">
                    {negocio.categoria} · {negocio.ciudad}
                    {negocio.direccion ? ` · ${negocio.direccion}` : ""} ·{" "}
                    <strong>{negocio.habilitado ? "Habilitado" : "Pendiente"}</strong>
                    {negocio.isBlocked && <strong> · Bloqueado</strong>}
                  </p>
                  <p className="cc-dashboard__meta">
                    ❤️ {negocio.likes ?? 0} · ⭐ {negocio.rating.toFixed(1)} ({negocio.reviews}) ·{" "}
                    {negocio.cantidadProductos ?? 0} producto(s)
                  </p>
                  {negocio.lat == null || negocio.lng == null ? (
                    <p className="cc-dashboard__aviso">
                      ⚠️ Sin ubicación cargada — no va a aparecer en &ldquo;cercanos&rdquo;
                    </p>
                  ) : null}
                </div>
                <div className="cc-dashboard__acciones">
                  <button
                    type="button"
                    className="cc-btn cc-btn--ghost"
                    disabled={procesandoId === negocio.id}
                    onClick={() => iniciarEdicion(negocio)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="cc-btn cc-btn--ghost"
                    disabled={procesandoId === negocio.id}
                    onClick={() => void alternarBloqueo(negocio)}
                  >
                    {negocio.isBlocked ? "Desbloquear" : "Bloquear"}
                  </button>
                  <button
                    type="button"
                    className="cc-btn cc-btn--eliminar"
                    disabled={procesandoId === negocio.id}
                    onClick={() => void eliminar(negocio.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
