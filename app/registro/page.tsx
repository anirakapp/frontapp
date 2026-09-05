"use client";

import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import "../styles/register.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://appback-six.vercel.app";

interface FormState {
  // Cuenta del dueño del negocio
  nombreDueno: string;
  email: string;
  password: string;
  // Datos del negocio
  nombreNegocio: string;
  categoria: string;
  ciudad: string;
  direccion: string;
  whatsapp: string;
  imagen: string;
}

const FORM_VACIO: FormState = {
  nombreDueno: "",
  email: "",
  password: "",
  nombreNegocio: "",
  categoria: "",
  ciudad: "",
  direccion: "",
  whatsapp: "",
  imagen: "",
};

export default function RegisterPage(): ReactElement {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(FORM_VACIO);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [ubicando, setUbicando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  // NUEVO: categorías estándar traídas del backend (derivadas del
  // DICCIONARIO que usa el buscador), para reemplazar el input libre por
  // un select y garantizar que lo que se guarda coincide con lo que
  // searchModel.js compara.
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

  function actualizar<K extends keyof FormState>(campo: K, valor: string): void {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  }

  function capturarUbicacion(): void {
    setError(null);

    if (!("geolocation" in navigator)) {
      setError(
        'Tu navegador no soporta geolocalización. Podés cargar el negocio igual, pero no va a aparecer en "cercanos".'
      );
      return;
    }

    setUbicando(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setUbicando(false);
      },
      () => {
        setError(
          "No pudimos acceder a tu ubicación. Revisá los permisos del navegador e intentá de nuevo."
        );
        setUbicando(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function enviar(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);

    if (
      !form.nombreDueno.trim() ||
      !form.email.trim() ||
      !form.password.trim() ||
      !form.nombreNegocio.trim() ||
      !form.categoria.trim() ||
      !form.ciudad.trim() ||
      !form.direccion.trim() ||
      !form.imagen.trim()
    ) {
      setError("Completá todos los campos obligatorios.");
      return;
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (!coords) {
      setError(
        'Tenés que tocar "Usar mi ubicación actual" para que tu negocio pueda aparecer cerca de tus clientes.'
      );
      return;
    }

    setEnviando(true);
    try {
      // 1) Crear la cuenta del dueño del negocio
      const resCuenta = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombreDueno,
          email: form.email,
          password: form.password,
        }),
      });
      const dataCuenta = await resCuenta.json();
      if (!resCuenta.ok) {
        throw new Error(dataCuenta.message || "No pudimos crear tu cuenta.");
      }

      const token: string = dataCuenta.token;
      localStorage.setItem("cc_negocio_token", token);

      // 2) Registrar el negocio asociado a esa cuenta (queda pendiente de aprobación)
      const resNegocio = await fetch(`${API_URL}/api/negocios/registro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: form.nombreNegocio,
          categoria: form.categoria,
          ciudad: form.ciudad,
          direccion: form.direccion,
          whatsapp: form.whatsapp || undefined,
          imagen: form.imagen,
          lat: coords.lat,
          lng: coords.lng,
        }),
      });
      const dataNegocio = await resNegocio.json();
      if (!resNegocio.ok) {
        throw new Error(dataNegocio.message || "No pudimos registrar tu negocio.");
      }

      setListo(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setEnviando(false);
    }
  }

  if (listo) {
    return (
      <div className="cc-page">
        <main className="cc-main">
          <div className="cc-card cc-register__exito">
            <span className="cc-register__exito-icono">✅</span>
            <h1>¡Listo, {form.nombreDueno.split(" ")[0]}!</h1>
            <p>
              Creamos tu cuenta y registramos <strong>{form.nombreNegocio}</strong> en{" "}
              {form.direccion}. Tu negocio va a aparecer en el listado apenas un
              administrador lo apruebe.
            </p>
            <button
              type="button"
              className="cc-btn cc-btn--primary"
              onClick={() => router.push("/")}
            >
              Volver al inicio
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="cc-page">
      <main className="cc-main cc-register">
        <div className="cc-card cc-register__card">
          <div className="cc-register__intro">
            <h1>Sumá tu negocio</h1>
            <p>
              Creá tu cuenta y cargá los datos de tu negocio. Una vez aprobado por un
              administrador, va a aparecer en el listado de &ldquo;¿Cuánto Compro?&rdquo;.
            </p>
          </div>

          <form onSubmit={(e) => void enviar(e)} className="cc-register__form">
            <div className="cc-card__section">
              <p className="cc-card__question">Tus datos</p>
              <div className="cc-register__grid">
                <label className="cc-register__campo">
                  <span>Nombre y apellido</span>
                  <input
                    value={form.nombreDueno}
                    onChange={(e) => actualizar("nombreDueno", e.target.value)}
                    placeholder="Juan Pérez"
                    required
                  />
                </label>
                <label className="cc-register__campo">
                  <span>Email</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => actualizar("email", e.target.value)}
                    placeholder="juan@negocio.com"
                    required
                  />
                </label>
                <label className="cc-register__campo">
                  <span>Contraseña</span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => actualizar("password", e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                </label>
              </div>
            </div>

            <div className="cc-card__section">
              <p className="cc-card__question">Tu negocio</p>
              <div className="cc-register__grid">
                <label className="cc-register__campo">
                  <span>Nombre del negocio</span>
                  <input
                    value={form.nombreNegocio}
                    onChange={(e) => actualizar("nombreNegocio", e.target.value)}
                    placeholder="Almacén Don José"
                    required
                  />
                </label>

                {/* NUEVO: select en lugar de input libre. Las opciones vienen
                    del backend (CATEGORIAS_ESTANDAR, derivadas del mismo
                    DICCIONARIO que usa el buscador), así el valor guardado
                    en la base siempre coincide con lo que searchModel.js
                    compara. */}
                <label className="cc-register__campo">
                  <span>Categoría</span>
                  <select
                    value={form.categoria}
                    onChange={(e) => actualizar("categoria", e.target.value)}
                    required
                    disabled={categorias.length === 0}
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
                </label>

                <label className="cc-register__campo">
                  <span>Ciudad</span>
                  <input
                    value={form.ciudad}
                    onChange={(e) => actualizar("ciudad", e.target.value)}
                    placeholder="Rosario"
                    required
                  />
                </label>
                <label className="cc-register__campo">
                  <span>WhatsApp</span>
                  <input
                    value={form.whatsapp}
                    onChange={(e) => actualizar("whatsapp", e.target.value)}
                    placeholder="341 555-5555"
                  />
                </label>
                <label className="cc-register__campo cc-register__campo--full">
                  <span>Dirección</span>
                  <input
                    value={form.direccion}
                    onChange={(e) => actualizar("direccion", e.target.value)}
                    placeholder="San Martín 1234, Rosario"
                    required
                  />
                </label>
                <label className="cc-register__campo cc-register__campo--full">
                  <span>Imagen (URL)</span>
                  <input
                    value={form.imagen}
                    onChange={(e) => actualizar("imagen", e.target.value)}
                    placeholder="https://…"
                    required
                  />
                </label>
              </div>

              <div className="cc-register__ubicacion">
                <button
                  type="button"
                  className="cc-btn cc-btn--ghost"
                  onClick={capturarUbicacion}
                  disabled={ubicando}
                >
                  {ubicando ? "Ubicando…" : "📍 Usar mi ubicación actual"}
                </button>
                {coords && (
                  <span className="cc-register__ubicacion-ok">✅ Ubicación capturada</span>
                )}
                <p className="cc-card__hint">
                  Sin esto tu negocio no va a poder aparecer como &ldquo;cerca tuyo&rdquo;
                  en los resultados de los usuarios.
                </p>
              </div>
            </div>

            {error && (
              <p className="cc-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="cc-btn cc-btn--calcular" disabled={enviando}>
              {enviando ? "Registrando…" : "Registrar negocio"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
