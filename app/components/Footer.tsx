// components/Footer.tsx
import type { ReactElement } from "react";
import Image from "next/image";

export default function Footer(): ReactElement {
  return (
    <footer className="cc-footer" id="footer">
      <div className="cc-footer__brand">
        <Image
          src="/assets/hero/canasta.jpg"
          alt="¿Cuánto Compro?"
          width={28}
          height={28}
          className="cc-footer__brand-icon"
        />
        <span>¿Cuánto Compro?</span>
      </div>

      <nav className="cc-footer__links" aria-label="Enlaces del sitio">
        <a href="#como-funciona">Cómo funciona</a>
        <a href="#privacidad">Privacidad</a>
        <a href="#terminos">Términos</a>
        <a href="#contacto">Contacto</a>
      </nav>

      <div className="cc-footer__social">
        <a href="#instagram" aria-label="Instagram">
          <Image
            src="/assets/redes/instagram.jpg"
            alt="Instagram"
            width={22}
            height={22}
            className="cc-footer__instagram"
          />
        </a>
        <a href="#facebook" aria-label="Facebook">
          <Image
            src="/assets/redes/facebook.jpg"
            alt="Facebook"
            width={22}
            height={22}
            className="cc-footer__facebook"
          />
        </a>
      </div>
    </footer>
  );
}