import type { ReactElement } from "react";
import SearchBar from "./SearchBar";
import type { Negocio } from "../lib/types";
import "../styles/header.css";

interface HeaderProps {
  ciudad: string;
  onResultados: (resultados: Negocio[], query: string) => void;
}

export default function Header({ ciudad, onResultados }: HeaderProps): ReactElement {
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

        <nav className="cc-header__nav" aria-label="Navegación principal">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#menus">Menús</a>
          <a href="#negocios">Ofertas cerca</a>
          <span className="cc-header__nav-divider" aria-hidden="true" />
          <a href="/negocios/registro" className="cc-header__nav-link cc-header__nav-link--cta">
            Registrá tu negocio
          </a>
          <a href="/admin/login" className="cc-header__nav-link cc-header__nav-link--login">
            Ingresar
          </a>
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
      </div>

      <div className="cc-header__search-row">
        <SearchBar ciudad={ciudad} onResultados={onResultados} />
      </div>
    </header>
  );
}
