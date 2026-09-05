"use client";
import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FiEye, FiEyeOff, FiHome } from "react-icons/fi";
import { login, isApiError } from "../lib/api";
import { saveSession } from "../lib/auth";
import "../styles/loginuser.css";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await login({ email, password });
      saveSession(token, user);
      router.push(next);
    } catch (err) {
      setError(isApiError(err) ? err.message : "No pudimos iniciar sesión.");
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
        <h1 className="cc-login__title">Iniciar sesión</h1>
        <p className="cc-login__hint">Ingresá con tu cuenta para dar like y valorar negocios.</p>

        <input
          type="email"
          className="cc-login__input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          required
        />

        <div className="cc-login__password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            className="cc-login__input cc-login__input--password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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
          {loading ? "Ingresando…" : "Ingresar"}
        </button>

        <p className="cc-login__switch">
          ¿No tenés cuenta?{" "}
          <a href={`/register${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}>
            Registrate
          </a>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
