"use client";
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiEye, FiEyeOff, FiHome } from "react-icons/fi";
import { register, isApiError } from "../lib/api";
import { saveSession } from "../lib/auth";
import "../styles/loginuser.css";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await register({ nombre, email, password });
      saveSession(token, user);
      router.push(next);
    } catch (err) {
      setError(isApiError(err) ? err.message : "No pudimos crear la cuenta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cc-login">
      <button
        type="button"
        className="cc-login__home"
        onClick={() => router.push("/")}
        aria-label="Volver al inicio"
        title="Volver al inicio"
      >
        <FiHome />
      </button>

      <form className="cc-login__card" onSubmit={(e) => void handleSubmit(e)}>
        <h1 className="cc-login__title">Creá tu cuenta</h1>
        <p className="cc-login__hint">Registrate para dar like y valorar negocios.</p>

        <input
          type="text"
          className="cc-login__input"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoFocus
          required
        />

        <input
          type="email"
          className="cc-login__input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="cc-login__password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            className="cc-login__input cc-login__input--password"
            placeholder="Contraseña (mínimo 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button
            type="button"
            className="cc-login__toggle-eye"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {error && (
          <p className="cc-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="cc-btn cc-btn--calcular" disabled={loading}>
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </button>

        <p className="cc-login__switch">
          ¿Ya tenés cuenta?{" "}
          <a href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}>
            Ingresá
          </a>
        </p>
      </form>
    </div>
  );
}
