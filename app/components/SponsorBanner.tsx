import type { ReactElement } from "react";

const WHATSAPP_NUMERO = "5493413559329";
const WHATSAPP_MENSAJE =
  "Hola! Vi cuantosomos.app y quiero información para auspiciar mi negocio.";

export default function SponsorBanner(): ReactElement {
  function handleClick(): void {
    const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
      WHATSAPP_MENSAJE
    )}`;
    window.open(url, "_blank");
  }

  return (
    <section className="cc-sponsor">
      <span className="cc-sponsor__icon" aria-hidden="true">
        <img
          src="/assets/hero/negocio.jpg"
          alt=""
          className="cc-sponsor__icon-img"
        />
      </span>
      <div className="cc-sponsor__copy">
        <h3>¿Tenés un comercio?</h3>
        <p>
          Auspiciá tu negocio y llegá a miles de personas cuando más te
          necesitan.
        </p>
      </div>
      <button type="button" className="cc-sponsor__cta" onClick={handleClick}>
        Quiero información
      </button>
    </section>
  );
}
