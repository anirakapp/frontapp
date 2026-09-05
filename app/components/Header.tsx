"use client";

import { useEffect, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "./SearchBar";
import type { Negocio } from "../lib/types";
import { getStoredUser, clearSession, isAdmin } from "../lib/auth";
import "../styles/header.css";

interface HeaderProps {
  ciudad: string;
  onResultados: (resultados: Negocio[], query: string) => void;
}

export default function Header({ ciudad, onResultados }: HeaderProps): ReactElement {
  const router = useRouter();
  const [logueado, setLogueado] = useState(false);
  const [esAdmin, setEsAdmin] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    setLogueado(Boolean(user));
    setEsAdmin(isAdmin());
  }, []);

  function handleLogout(): void {
    clearSession();
    setLogueado(false);
    setEsAdmin(false);
    setMenuAbierto(false);
    router.push("/");
  }

  function irAPanel(): void {
    setMenuAbierto(false);
    router.push(esAdmin ? "/admin" : "/panel");
  }

  return (
    <header className="cc-header">
      <div className="cc-header__top">
        <div className="cc-header__brand">
          <span className="cc-header__logo" aria-hidden="true">
            <img
              src="/assets/hero/canasta.jpg"
              alt=""
              className="cc-header__logo-img"
            />
          </span>
          <span className="cc-header__title">
            ¿Cuánto
            <br />
            Compro?
          </span>
        </div>

        <nav className="cc-header__nav cc-header__nav--desktop" aria-label="Navegación principal">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#menus">Menús</a>
          <a href="#negocios">Ofertas cerca</a>
          <span className="cc-header__nav-divider" aria-hidden="true" />
          <a href="/registro" className="cc-header__nav-link cc-header__nav-link--cta">
            Registrá tu negocio
          </a>

          {logueado ? (
            <>
              <button
                type="button"
                className="cc-header__nav-link cc-header__nav-link--panel"
                onClick={irAPanel}
              >
                Panel
              </button>
              <button
                type="button"
                className="cc-header__nav-link cc-header__nav-link--login"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <a href="/register" className="cc-header__nav-link cc-header__nav-link--cta">
                Registrate
              </a>
              <a href="/login" className="cc-header__nav-link cc-header__nav-link--login">
                Ingresar
              </a>
            </>
          )}
        </nav>

        <button type="button" className="cc-header__ciudad">
          <img
            src="/assets/hero/ubicacion.jpg"
            alt=""
            aria-hidden="true"
            className="cc-header__ubicacion"
          />
          <span>{ciudad}</span>
          <span aria-hidden="true">▾</span>
        </button>

        <button
          type="button"
          className="cc-header__menu-toggle"
          aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuAbierto}
          aria-controls="cc-header-mobile-nav"
          onClick={() => setMenuAbierto((v) => !v)}
        >
          <span aria-hidden="true">{menuAbierto ? "✕" : "☰"}</span>
        </button>
      </div>

      {menuAbierto && (
        <nav
          id="cc-header-mobile-nav"
          className="cc-header__nav cc-header__nav--mobile"
          aria-label="Navegación mobile"
        >
          <a href="#como-funciona" onClick={() => setMenuAbierto(false)}>
            Cómo funciona
          </a>
          <a href="#menus" onClick={() => setMenuAbierto(false)}>
            Menús
          </a>
          <a href="#negocios" onClick={() => setMenuAbierto(false)}>
            Ofertas cerca
          </a>
          
            <a href="/registro"
            className="cc-header__nav-link--cta"
            onClick={() => setMenuAbierto(false)}
          >
            Registrá tu negocio
          </a>

          {logueado ? (
            <>
              <button
                type="button"
                className="cc-header__nav-link--panel"
                onClick={irAPanel}
              >
                Panel
              </button>
              <button
                type="button"
                className="cc-header__nav-link--login"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              
               <a href="/register"
                className="cc-header__nav-link--cta"
                onClick={() => setMenuAbierto(false)}
              >
                Registrate
              </a>
              
               <a href="/login"
                className="cc-header__nav-link--login"
                onClick={() => setMenuAbierto(false)}
              >
                Ingresar
              </a>
            </>
          )}
        </nav>
      )}

      <div className="cc-header__search-row">
        <SearchBar ciudad={ciudad} onResultados={onResultados} />
      </div>
    </header>
  );
}
